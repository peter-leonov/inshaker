#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'
require 'optparse'

class CocktailsProcessor < Barman::Processor

  module Config
    COCKTAILS_DIR = Barman::BASE_DIR + "Cocktails/"
    HTDOCS_DIR    = Barman::HTDOCS_DIR
    
    HTDOCS_ROOT        = HTDOCS_DIR + "cocktails/"
    DB_JS              = HTDOCS_DIR + "db/cocktails.js"
    DB_JS_TAGS         = HTDOCS_DIR + "db/tags.js"
    DB_JS_STRENGTHS    = HTDOCS_DIR + "db/strengths.js"
    
    
    NOSCRIPT_LINKS     = HTDOCS_ROOT + "links.html"
    IMAGES_DIR         = HTDOCS_DIR + "i/cocktail/"
    IMAGES_BG_DIR      = IMAGES_DIR + "bg/"
    IMAGES_BIG_DIR     = IMAGES_DIR + "b/"
    IMAGES_SMALL_DIR   = IMAGES_DIR + "s/"
    IMAGES_PRINT_DIR   = IMAGES_DIR + "print/"
    
    VIDEOS_DIR = HTDOCS_DIR + "v/"
    
    COCKTAIL_ERB  = Barman::TEMPLATES_DIR + "cocktail.rhtml"
    RECOMENDATIONS_ERB  = Barman::TEMPLATES_DIR + "recomendations.rhtml"
  end
  
  def initialize
    super
    @cocktails = {}
    @cocktails_present = {}
    @tags = []
    @strengths = []
  end
  
  def job_name
    "смешивалку коктейлей"
  end
  
  def pre_job
    @options = {}
    names = @options[:names] = {}
    OptionParser.new do |opts|
      opts.banner = "Запускайте так: cocktails.rb [опции]"
      
      opts.on("-f", "--force", "обновлять невзирая на кеш") do |v|
        @options[:force] = v
      end
      opts.on("-t", "--text", "обрабатывать только текст") do |v|
        @options[:text] = v
      end
      opts.on("--names '911','Ай кью'", Array, "обновить только указанные коктейли") do |list|
        list.each do |v|
          names[v.yi] = true
        end
      end
      opts.on("-h", "--help", "помочь") do
        puts opts
        exit
      end
    end.parse!
    
    if @options[:force] && !@options[:names].empty?
      error "низя указывать --force и --names вместе"
      exit
    end
  end
  
  def job
    prepare_dirs
    prepare_templates
    prepare_cocktails
    prepare_tags_and_strengths
    
    update_cocktails
    update_recomendations
    
    unless errors?
      flush_json
      flush_links
    end
  end
  
  def prepare_dirs
    # FileUtils.rmtree [Config::HTDOCS_ROOT, Config::IMAGES_DIR, Config::VIDEOS_DIR]
    
    FileUtils.mkdir_p [Config::HTDOCS_ROOT, Config::IMAGES_DIR, Config::IMAGES_BG_DIR,
      Config::IMAGES_BIG_DIR, Config::IMAGES_SMALL_DIR, Config::VIDEOS_DIR]
  end
  
  def prepare_templates
    @cocktail_renderer = ERB.new(File.read(Config::COCKTAIL_ERB))
    @recomendations_renderer = ERB.new(File.read(Config::RECOMENDATIONS_ERB))
  end
  
  def prepare_cocktails
    if File.exists?(Config::DB_JS) && !@options[:force]
      @cocktails_mtime = File.mtime(Config::DB_JS)
      @cocktails = JSON.parse(File.read(Config::DB_JS))
    else
      @cocktails_mtime = Time.at(0)
    end
  end
  
  def update_cocktails
    names = @options[:names]
    unless names.empty?
      say "обновляю указанные коктейли: #{names.keys.join(", ")}"
      indent do
      done = 0
      Dir.new(Config::COCKTAILS_DIR).each_dir do |dir|
        next if !names[dir.name]
        process_cocktail dir
        done += 1
      end
      say "#{done.items("обновлен", "обновлено", "обновлено")} #{done} #{done.items("коктейль", "коктейля", "коктейлей")}"
      end # indent
      return
    end
    
    say "собираю список"
    indent do
    Dir.new(Config::COCKTAILS_DIR).each_dir do |cocktail_dir|
      @cocktails_present[cocktail_dir.name] = true
    end
    say "нашел #{@cocktails_present.keys.length} #{@cocktails_present.keys.length.items("коктейль", "коктейля", "коктейлей")}"
    end # indent
    
    
    say "удаляю коктейли"
    indent do
    deleted = @cocktails.keys - @cocktails_present.keys
    deleted.each do |name|
      say name
      update_images name, @cocktails[name], true unless @options[:text]
      @cocktails.delete(name)
    end
    say "#{deleted.length.items("удален", "удалено", "удалено")} #{deleted.length} #{deleted.length.items("коктейль", "коктейля", "коктейлей")}"
    end # indent
    
    added = {}
    say "добавляю коктейли"
    indent do
    done = 0
    Dir.new(Config::COCKTAILS_DIR).each_dir do |dir|
      next if @cocktails[dir.name]
      added[dir.name] = true
      process_cocktail dir
      done += 1
    end
    say "#{done.items("добавлен", "добавлено", "добавлено")} #{done} #{done.items("коктейль", "коктейля", "коктейлей")}"
    end # indent
    
    say "обновляю коктейли"
    indent do
    done = 0
    Dir.new(Config::COCKTAILS_DIR).each_dir do |dir|
      next if added[dir.name] || @cocktails[dir.name] && File.mtime(dir.path) <= @cocktails_mtime
      process_cocktail dir
      done += 1
    end
    say "#{done.items("обновлен", "обновлено", "обновлено")} #{done} #{done.items("коктейль", "коктейля", "коктейлей")}"
    end # indent
  end
  
  def update_recomendations
    say "обновляю рекомендации"
    indent do
      @cocktails.each do |name, hash|
        recs = get_related name
        templ = CocktailRecomendationsTemplate.new(recs)
        File.open(Config::HTDOCS_ROOT + hash["name_eng"].html_name + ".recomendations.html", "w+") do |html|
          html.write @recomendations_renderer.result(templ.get_binding)
        end
        
      end
    end # indent
  end
  
  def get_related one
    cocktail = @cocktails[one]
    ingreds = cocktail["ingredients"].map {|v| v[0]}
    tags = cocktail["tags"]
    weights = {}
    @cocktails.each do |name, hash|
      next if one == name
      weight = 0
      hash["ingredients"].each do |ingred|
        weight += 1000 if ingreds.index ingred[0]
      end
      weight += 100 * (tags & hash["tags"]).length
      weight += 100 - hash["ingredients"].length
      weights[name] = weight
    end
    
    names = weights.keys.sort { |a, b| x = weights[b] <=> weights[a]; x == 0 ? a <=> b : x }
    return names.map { |e| @cocktails[e] }
  end
  
  def process_cocktail dir
    name = dir.name
    say name
    indent do
    @cocktail               = {}
    @cocktail["name"]        = name
    @cocktail["tags"]        = []
    @cocktail["tools"]       = []
    @cocktail["ingredients"] = []
    @cocktail["recs"] = []
    
    parse_about_text  File.read(dir.path + "/about.txt")
    parse_legend_text File.read(dir.path + "/legend.txt")
    
    @cocktails[@cocktail["name"]] = @cocktail
    
    update_images @cocktail["name"], @cocktail unless @options[:text]
    update_html @cocktail["name"], @cocktail
    update_video dir, @cocktail["name"], @cocktail
    end # indent
  end
  
  def prepare_tags_and_strengths
    order = YAML::load(File.open("#{Config::COCKTAILS_DIR}/tags.yaml"))
    order.each do |name, num|
      @tags[num-1] = name
    end
    
    order = YAML::load(File.open("#{Config::COCKTAILS_DIR}/strengths.yaml"))
    order.each do |name, num|
      @strengths[num-1] = name
    end
  end
  
  def flush_json
     @cocktails.each do |name, hash|
      hash.delete("desc_start")
      hash.delete("desc_end")
      hash.delete("recs")
     end
     
     say "сохраняю данные о коктейлях, тегах и крепости"
     flush_json_object(@cocktails, Config::DB_JS)
     flush_json_object(@tags, Config::DB_JS_TAGS)
     flush_json_object(@strengths, Config::DB_JS_STRENGTHS)
  end
  
  def flush_links
    File.open(Config::NOSCRIPT_LINKS, "w+") do |links|
      links.puts "<ul>"
      @cocktails.keys.sort.each do |name|
        hash = @cocktails[name]
        links.puts %Q{<li><a href="/cocktails/#{hash["name_eng"].html_name}.html">#{name} (#{hash["name_eng"]})</a></li>}
      end
      links.puts "</ul>"
    end
  end
  
  def update_html name, hash
    cocktail = CocktailTemplate.new(hash)
    File.open(Config::HTDOCS_ROOT + hash["name_eng"].html_name + ".html", "w+") do |html|
      html.write @cocktail_renderer.result(cocktail.get_binding)
    end
  end
  
  def update_images name, hash, delete = false
    from = Config::COCKTAILS_DIR + name + "/"
    
    html_name = hash["name_eng"].html_name
    to_big   = Config::IMAGES_BIG_DIR   + html_name + ".png"
    to_small = Config::IMAGES_SMALL_DIR + html_name + ".png"
    to_bg    = Config::IMAGES_BG_DIR    + html_name + ".png"
    
    if delete
      FileUtils.rmtree([to_big, to_small, to_bg])
    else
      from_big   = from + "big.png"
      from_small = from + "small.png"
      from_bg    = from + "bg.png"
      
      if File.exists?(from_big)
        flush_pngm_img(from_big, to_big)
      else
        error "не могу найти большую картинку коктейля (big.png)"
      end
      
      if File.exists?(from_small)
        FileUtils.cp_r(from_small, to_small, @mv_opt)
      else
        error "не могу найти маленькую картинку коктейля (small.png)"
      end
      
      if File.exists?(from_bg)
        # flush_masked_optimized_pngm_img(Config::COCKTAILS_DIR + "bg_mask.png", from_bg, to_bg, "DstIn")
        FileUtils.cp_r(from_bg, to_bg, @mv_opt)
      else
        error "не могу найти заставку коктейля (bg.png)"
      end
    end
  end
  
  def update_video dir, name, hash
    from = dir.path + "/video.flv"
    if File.exists? from
      say "нашел видео-ролик"
      # to = Config::VIDEOS_DIR + hash["name_eng"].html_name + ".flv"
      # FileUtils.cp_r(from, to, @mv_opt)
      hash["video"] = true
    end
  end
  
private

  def parse_about_text(about_text)
    parse_title about_text.scan(/.*Название:\ *\n(.+)\n.*/)[0][0]
    parse_vp about_text.scan(/.*Винительный падеж:\ *\n(.+)\n.*/)
    parse_teaser about_text.scan(/.*Тизер:\ (.+)\ *\n.*/)[0][0]
    parse_strength about_text.scan(/.*Крепость:\ *\n(.+)\ *\n.*/)[0][0]
    if about_text.scan(/.*Группы:\ *\n(.+)\n\nИнгредиенты.*/m) != [] # empty
      parse_tags about_text.scan(/.*Группы:\ *\n(.+)\n\nИнгредиенты.*/m)[0][0]
    else
      parse_tags ""
    end
    parse_ingredients about_text.scan(/.*Ингредиенты:\ *\n(.+)\n\nШтучки.*/m)[0][0]
    parse_tools about_text.scan(/.*Штучки:\ *\n(.+)\n\nКак приготовить.*/m)[0][0]
    parse_receipt about_text.scan(/.*Как приготовить:\ *\n(.+)*/m)[0][0]
  end
  
  def parse_title(title)
    if title =~ /;/
      error "неверный формат названия"
    end
    @cocktail["name_eng"] = title
  end
  
  def parse_vp(name)
    if name[0]
      @cocktail["nameVP"] = name[0][0]
    end
  end
  
  def parse_teaser(teaser)
    @cocktail["teaser"] = teaser
  end
  
  def parse_strength(strength)
    strength = strength.trim
    @cocktail["strength"] = strength
    if(!@strengths.include?(strength)) then @strengths << strength end
  end
  
  def parse_tags(tags)
    if tags == ""
      @cocktail["tags"] = []
      return
    end
    tags = tags.split("\n")
    tags.each do |tag|
      tag = tag.trim
      @cocktail["tags"] << tag
      @tags << tag unless @tags.include?(tag)
    end
  end
  
  def parse_ingredients(ingredients)
    ingredients = ingredients.split("\n")
    ingredients.each do |ing|
      name, dose = ing.split(": ")
      @cocktail["ingredients"] << [name, dose.zpt]
    end
  end
  
  def parse_tools(tools)
    tools = tools.split("\n")
    tools.each do |tool|
      @cocktail["tools"] << tool
    end
  end
  
  def parse_receipt(receipt)
    # res = []
    # lines = receipt.split("\n")
    # lines.each do |line|
    #   letters = line.split("")
    #   # p letters[0], letters[0].downcase
    #   if(letters[0] != letters[0].downcase)
    #     res.push line
    #   else
    #     error "!!!!!!"
    #     idx = res.index res.last
    #     res[idx] = res[idx] + " " + line
    #   end
    # end
    # @cocktail["receipt"] = res
    @cocktail["receipt"] = receipt.split("\n")
  end
  
  def parse_legend_text(text)
    if text.slice(0,1) == "#"
      paragraphs = text.split("#")
      @cocktail["desc_start"] = paragraphs[1]
      @cocktail["desc_end"] = paragraphs[2] ? paragraphs[2].split(%r{[\n\r]}).join("\n") : ""
    else
      paragraphs = text.split(%r{[\n\r]})
      @cocktail["desc_start"] = paragraphs.first
      @cocktail["desc_end"]   = paragraphs[1..-1].join "\n"
    end
  end
  
end

exit CocktailsProcessor.new.run
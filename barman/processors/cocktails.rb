#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'
require 'optparse'
# require 'benchmark'

class CocktailsProcessor < Barman::Processor

  module Config
    COCKTAILS_DIR = Barman::BASE_DIR + "Cocktails/"
    HTDOCS_DIR    = Barman::HTDOCS_DIR
    
    HTDOCS_ROOT        = HTDOCS_DIR + "cocktail/"
    DB_JS              = HTDOCS_DIR + "db/cocktails.js"
    DB_JS_TAGS         = HTDOCS_DIR + "db/tags.js"
    DB_JS_STRENGTHS    = HTDOCS_DIR + "db/strengths.js"
    DB_JS_METHODS      = HTDOCS_DIR + "db/methods.js"
    GOODS_DB           = HTDOCS_DIR + "db/goods.js"
    
    
    NOSCRIPT_LINKS     = HTDOCS_ROOT + "links.html"
    
    VIDEOS_DIR = HTDOCS_DIR + "v/"
    
    COCKTAIL_ERB  = Barman::TEMPLATES_DIR + "cocktail.rhtml"
    RECOMENDATIONS_ERB  = Barman::TEMPLATES_DIR + "recomendations.rhtml"
  end
  
  def initialize
    super
    @goods = {}
    @cocktails = {}
    @cocktails_present = {}
    @tags = []
    @strengths = []
    @local_properties = ["desc_start", "desc_end", "recs"]
  end
  
  def job_name
    "смешивалку коктейлей"
  end
  
  def pre_job
    @options = {:force => true}
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
          names[v] = true
        end
      end
      opts.on("-h", "--help", "помочь") do
        puts opts
        exit
      end
    end.parse!
    
    if @options[:force] && !@options[:names].empty?
      warning "--names отменяет действие --force"
      @options[:force] = false
    end
  end
  
  def job
    prepare_dirs
    prepare_templates
    prepare_goods
    prepare_cocktails
    prepare_tags_and_strengths_and_methods
    
    touched = update_cocktails
    
    check_intergity
    
    unless errors?
      update_recomendations if touched > 0
      
      flush_tags_and_strengths_and_methods
      flush_cocktails
      flush_links
    end
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::HTDOCS_ROOT]
  end
  
  def prepare_templates
    @cocktail_renderer = ERB.new(File.read(Config::COCKTAIL_ERB))
    @recomendations_renderer = ERB.new(File.read(Config::RECOMENDATIONS_ERB))
  end
  
  def prepare_goods
    if File.exists?(Config::GOODS_DB)
      @goods = load_json(Config::GOODS_DB)
    end
  end
  
  def check_intergity
    say "проверяю ингредиенты"
    indent do
    @cocktails.each do |name, cocktail|
      cocktail["ingredients"].each do |ingred|
        unless @goods[ingred[0]]
          error "#{name}: нет такого ингредиента «#{ingred[0]}»"
          if ingred[0].has_diacritics
            say "пожалуйста, проверь буквы «й» и «ё» на «правильность»"
          end
        end
      end
    end
    end # indent
  end
  
  def prepare_cocktails
    if File.exists?(Config::DB_JS) && !@options[:force]
      @cocktails_mtime = File.mtime(Config::DB_JS)
      @cocktails = JSON.parse(File.read(Config::DB_JS))
    else
      @cocktails_mtime = nil
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
      return done
    end
    
    touched = 0
    say "собираю список"
    indent do
    Dir.new(Config::COCKTAILS_DIR).each_dir do |cocktail_dir|
      @cocktails_present[cocktail_dir.name] = true
    end
    say "нашел #{@cocktails_present.keys.length} #{@cocktails_present.keys.length.items("коктейль", "коктейля", "коктейлей")}"
    end # indent
    
    
    deleted = @cocktails.keys - @cocktails_present.keys
    unless deleted.empty?
      say "удаляю коктейли"
      indent do
      deleted.each do |name|
        say name
        @cocktails.delete(name)
      end
      say "#{deleted.length.items("удален", "удалено", "удалено")} #{deleted.length} #{deleted.length.items("коктейль", "коктейля", "коктейлей")}"
      touched += deleted.length
      end # indent
    end
    
    
    added = {}
    toadd = []
    Dir.new(Config::COCKTAILS_DIR).each_dir do |dir|
      next if @cocktails[dir.name]
      toadd << dir
    end
    unless toadd.empty?
      say "добавляю коктейли"
      indent do
      done = 0
      toadd.each do |dir|
        added[dir.name] = true
        process_cocktail dir
        done += 1
      end
      say "#{done.items("добавлен", "добавлено", "добавлено")} #{done} #{done.items("коктейль", "коктейля", "коктейлей")}"
      touched += done
      end # indent
    end
    
    
    toupdate = []
    Dir.new(Config::COCKTAILS_DIR).each_dir do |dir|
      next if added[dir.name] || @cocktails[dir.name] && (@cocktails_mtime && dir.deep_mtime <= @cocktails_mtime)
      toupdate << dir
    end
    unless toupdate.empty?
      say "обновляю коктейли"
      indent do
      done = 0
      toupdate.each do |dir|
        process_cocktail dir
        done += 1
      end
      say "#{done.items("обновлен", "обновлено", "обновлено")} #{done} #{done.items("коктейль", "коктейля", "коктейлей")}"
      touched += done
      end # indent
    end
    return touched
  end
  
  def update_recomendations
    say "обновляю рекомендации"
    # puts Benchmark.measure { calculate_related }
    calculate_related
    indent do
      @cocktails.each do |name, hash|
        templ = CocktailRecomendationsTemplate.new(hash["recs"])
        File.open(Config::HTDOCS_ROOT + hash["name_eng"].html_name + ".recomendations.html", "w+") do |html|
          html.write @recomendations_renderer.result(templ.get_binding)
        end
        
      end
    end # indent
  end
  
  def calculate_related
    cocktails = []
    ingredient_hashes = []
    tag_hashes = []
    @cocktails.keys.sort.each do |name|
      cocktail = @cocktails[name]
      cocktails << cocktail
      
      ingredient_hashes << hash = {}
      cocktail["ingredients"].each { |v| hash[v[0]] = true }
      
      tag_hashes << hash = {}
      cocktail["tags"].each { |v| hash[v] = true }
    end
    count = cocktails.length
    
    weights = []
    weights[count * count] = 0
    nums = (0...count).to_a
    
    i = 0
    while i < count
      a = cocktails[i]
      a_tags = tag_hashes[i]
      a_ingredients = ingredient_hashes[i]
      
      weights[i * count + i] = 0
      j = i + 1
      while j < count
        b = cocktails[j]
        
        weight = 0
        b["ingredients"].each do |v|
          weight += 10000 if a_ingredients[v[0]]
        end
        b["tags"].each do |v|
          weight += 1000 if a_tags[v]
        end
        weight += 100 - b["ingredients"].length
        
        weights[i * count + j] = weights[j * count + i] = weight
        j += 1
      end
      
      pos = i * count
      a["recs"] = nums.sort_by { |n| -weights[pos + n] }.map { |n| cocktails[n] }
      
      i += 1
    end
    
    unless cocktails[0]["recs"].last == cocktails[0] && cocktails[250]["recs"].last == cocktails[250]
      error "кектейль не идет последним у себя в рекомендациях"
    end
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
    
    @cocktails[name] = @cocktail
    
    html_name = @cocktail["name_eng"].html_name
    
    dir_path = "#{Config::HTDOCS_ROOT}/#{html_name}"
    FileUtils.mkdir_p(dir_path)
    root_dir = Dir.open(dir_path)
    root_dir.name = html_name
    
    guess_methods @cocktail
    update_images dir, root_dir, @cocktail unless @options[:text]
    update_html root_dir, @cocktail
    update_json root_dir, @cocktail
    end # indent
  end
  
  def prepare_tags_and_strengths_and_methods
    @tags = YAML::load(File.open("#{Config::COCKTAILS_DIR}/tags.yaml"))
    @strengths = YAML::load(File.open("#{Config::COCKTAILS_DIR}/strengths.yaml"))
    @methods = YAML::load(File.open("#{Config::COCKTAILS_DIR}/methods.yaml"))
  end
  
  def guess_methods cocktail
    methods = {}
    tools = cocktail["tools"]
    
    methods["в шейкере"] = true if tools.index("Шейкер")
    methods["давят пестиком"] = true if tools.index("Пестик")
    methods["в блендере"] = true if tools.index("Блендер") || tools.index("Коктейльный миксер")
    methods["давят пестиком"] = true if tools.index("Пестик")
    methods["миксуют в стакане"] = true if tools.index("Стакан для смешивания")
    methods["укладывают слои"] = true if tools.index("Стопка") && tools.index("Коктейльная ложка") && !tools.index("Кувшин") && (tools.length == 2 || tools.index("Трубочки") || tools.index("Пресс для цитруса") || tools.index("Зажигалка"))
    
    num = methods.keys.length
    if num == 0
      cocktail["method"] = "просто"
    elsif num == 1
      cocktail["method"] = methods.keys[0]
    else
      cocktail["method"] = "не очень просто"
    end
  end
  
  def update_html dst, hash
    tpl = CocktailTemplate.new(hash)
    File.write("#{dst.path}/index.html", @cocktail_renderer.result(tpl.get_binding))
  end
  
  def update_json dst, hash
    data = {}
    @local_properties.each do |prop|
      data[prop] = hash.delete(prop)
    end
    flush_json_object(data, "#{dst.path}/data.json")
  end
  
  def update_images src, dst, hash
    to_big     = "#{dst.path}/big.png"
    to_small   = "#{dst.path}/small.png"
    to_bg      = "#{dst.path}/bg.png"
    
    from_big   = "#{src.path}/big.png"
    from_small = "#{src.path}/small.png"
    from_bg    = "#{src.path}/bg.png"
    
    if File.exists?(from_big)
      flush_pngm_img(from_big, to_big)
    else
      error "не могу найти большую картинку коктейля (big.png)"
    end
    
    if File.exists?(from_small)
      File.cp_if_different(from_small, to_small)
    else
      error "не могу найти маленькую картинку коктейля (small.png)"
    end
    
    if File.exists?(from_bg)
      # flush_masked_optimized_pngm_img(Config::COCKTAILS_DIR + "bg_mask.png", from_bg, to_bg, "DstIn")
      File.cp_if_different(from_bg, to_bg)
    else
      error "не могу найти заставку коктейля (bg.png)"
    end
  end
  
  def flush_cocktails
     say "сохраняю данные о коктейлях"
     flush_json_object(@cocktails, Config::DB_JS)
  end
  
  def flush_tags_and_strengths_and_methods
     say "сохраняю списки тегов, крепости и приготовления"
     
     count = {}
     count.default = 0
     @cocktails.each do |name, hash|
       hash["tags"].each { |tag| count[tag] += 1 }
     end
     tags = []
     # p @tags
     @tags.each do |tag|
      if count[tag] == 0
        error "нет коктейлей в группе «#{tag}»"
      elsif count[tag] < 3
        warning "слишком мало коктейлей (#{count[tag]}) в группе «#{tag}»"
        indent do
        @cocktails.each do |name, hash|
          if hash["tags"].index tag
            say name
          end
        end
        end # indent
      else
        tags << tag
      end
     end
     
     flush_json_object(tags, Config::DB_JS_TAGS)
     flush_json_object(@strengths, Config::DB_JS_STRENGTHS)
     flush_json_object(@methods, Config::DB_JS_METHODS)
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
      if tag.empty?
        error "пустой тег"
        next
      end
      unless @tags.index tag
        error "неизвестный тег #{tag}"
        next
      end
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
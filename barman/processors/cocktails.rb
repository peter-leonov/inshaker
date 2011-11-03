#!/usr/bin/env ruby1.9
# encoding: utf-8
require "inshaker"
require "entities/cocktail"
require "entities/ingredient"
require "entities/tool"

class CocktailsProcessor < Inshaker::Processor

  module Config
    include Cocktail::Config
  end
  
  def initialize
    super
    @ingredient_groups = []
    @ingredient_weight_by_group = {}
    @ingredient_weight_by_group.default = -1
    @cocktails = {}
    @cocktails_present = {}
    @groups = []
    @tags = []
    @tags_ci = {}
    @tags_used = {}
    @strengths = []
    @local_properties = ["desc_start", "desc_end", "teaser", "receipt", "html_name"]
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
    sync_base "Cocktails"
    
    Ingredient.init
    Tool.init
    Cocktail.init
    
    prepare_dirs
    prepare_templates
    prepare_ingredients
    prepare_cocktails
    prepare_groups_and_strengths_and_methods
    
    touched = update_cocktails
    
    check_intergity
    
    unless errors?
      cleanup_deleted
      flush_groups_and_strengths_and_methods
      flush_json
      flush_links
    end
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::HTDOCS_ROOT]
  end
  
  def prepare_templates
    @cocktail_renderer = ERB.new(File.read(Config::COCKTAIL_ERB))
  end
  
  def prepare_ingredients
    if File.exists?(Ingredient::Config::DB_JS_GROUPS)
      @ingredient_groups = load_json(Ingredient::Config::DB_JS_GROUPS)
      
      hash = {}
      i = 1
      @ingredient_groups.each do |v|
        hash[v] = i
        i += 1
      end
      
      Ingredient.all.each do |ingredient|
        @ingredient_weight_by_group[ingredient["name"]] = hash[ingredient["group"]]
      end
    end
  end
  
  def check_intergity
    say "проверяю ингредиенты"
    indent do
    @cocktails.each do |name, cocktail|
      cocktail["ingredients"].each do |ingred|
        unless Ingredient[ingred[0]]
          error "#{name}: нет такого ингредиента «#{ingred[0]}»"
          if ingred[0].has_diacritics
            say "пожалуйста, проверь буквы «й» и «ё» на «правильность»"
          end
        end
      end
    end
    end # indent
    
    say "проверяю украшения"
    indent do
    @cocktails.each do |name, cocktail|
      cocktail["garnish"].each do |ingred|
        unless Ingredient[ingred[0]]
          error "#{name}: нет такого ингредиента «#{ingred[0]}»"
          if ingred[0].has_diacritics
            say "пожалуйста, проверь буквы «й» и «ё» на «правильность»"
          end
        end
      end
    end
    end # indent
    
    say "проверяю штучки"
    indent do
    @cocktails.each do |name, cocktail|
      cocktail["tools"].each do |tool|
        unless Tool[tool]
          error "#{name}: нет такой штучки «#{tool}»"
          if tool.has_diacritics
            say "пожалуйста, проверь буквы «й» и «ё» на «правильность»"
          end
        end
      end
    end
    end # indent
    
    say "проверяю группы"
    indent do
    
    count = {}
    count.default = 0
    @cocktails.each do |name, hash|
      hash["tags"].each { |group| count[group] += 1 }
    end
    groups = []
    
    @groups.each do |group|
     if count[group] == 0
       error "нет коктейлей в группе «#{group}»"
     elsif count[group] < 3
       warning "слишком мало коктейлей (#{count[group]}) в группе «#{group}»"
       indent do
       @cocktails.each do |name, hash|
         if hash["groups"].index group
           say name
         end
       end
       end # indent
     else
       groups << group
     end
    end
    
    @groups = groups
    
    end # indent
    
    
    say "проверяю теги"
    indent do
    
    unused_tags = @tags - @tags_used.keys
    # warn about unused tags
    unless unused_tags.empty?
      warning "нет коктейлей с #{unused_tags.length.plural("тегом", "тегами", "тегами")} #{unused_tags.map{|v| "«#{v}»"}.join(", ")}"
    end
    
    # delete unused tags
    @tags -= unused_tags
    
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
      say "#{done.plural("обновлен", "обновлено", "обновлено")} #{done} #{done.plural("коктейль", "коктейля", "коктейлей")}"
      end # indent
      return done
    end
    
    touched = 0
    say "собираю список"
    indent do
    Dir.new(Config::COCKTAILS_DIR).each_dir do |cocktail_dir|
      @cocktails_present[cocktail_dir.name] = true
    end
    say "нашел #{@cocktails_present.keys.length} #{@cocktails_present.keys.length.plural("коктейль", "коктейля", "коктейлей")}"
    end # indent
    
    
    deleted = @cocktails.keys - @cocktails_present.keys
    unless deleted.empty?
      say "удаляю коктейли"
      indent do
      deleted.each do |name|
        say name
        @cocktails.delete(name)
      end
      say "#{deleted.length.plural("удален", "удалено", "удалено")} #{deleted.length} #{deleted.length.plural("коктейль", "коктейля", "коктейлей")}"
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
      say "#{done.plural("добавлен", "добавлено", "добавлено")} #{done} #{done.plural("коктейль", "коктейля", "коктейлей")}"
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
      say "#{done.plural("обновлен", "обновлено", "обновлено")} #{done} #{done.plural("коктейль", "коктейля", "коктейлей")}"
      touched += done
      end # indent
    end
    return touched
  end
  
  def process_cocktail dir
    name = dir.name
    say name
    indent do
    
    if name.cs_index != name
      error "в названии коктейля есть лишние символы (обычно, это пробелы)"
    end
    
    @cocktail                = {}
    @cocktail["name"]        = name
    @cocktail["tools"]       = []
    @cocktail["ingredients"] = []
    
    legend_path = dir.path + "/legend.txt"
    parse_legend_text File.read(legend_path)
    
    about = load_yaml("#{dir.path}/about.yaml")
    
    @cocktail["name_eng"] = about["Name"]
    @cocktail["teaser"] = about["Тизер"]
    @cocktail["ingredients"] = parse_parts(about["Ингредиенты"])
    if about["Украшения"]
      @cocktail["garnish"] = parse_parts(about["Украшения"])
    else
      @cocktail["garnish"] = []
    end
    @cocktail["tools"] = about["Штучки"]
    @cocktail["receipt"] = about["Как приготовить"]
    
    
    @cocktail["ingredients"] = sort_parts_by_group(@cocktail["ingredients"])
    @cocktail["garnish"] = sort_parts_by_group(@cocktail["garnish"])
    @cocktail["sorted_parts"] = sort_parts_by_group(merge_parts(@cocktail["ingredients"], @cocktail["garnish"]))
    
    # puts %Q{"#{name}","#{@cocktail["teaser"]}"}
    
    if about["Добавлен"]
      @cocktail["added"] = Time.gm(*about["Добавлен"].split(".").reverse.map{|v|v.to_i})
    else
      error "не могу найти дату доавления коктейля"
    end
    
    if about["Винительный падеж"]
      @cocktail["nameVP"] = about["Винительный падеж"]
    end
    
    if about["План покупок"]
      cart = {}
      if about["План покупок"]["Количество"]
        cart["count"] = about["План покупок"]["Количество"]
      end
      if about["План покупок"]["Множественные"]
        cart["plural"] = about["План покупок"]["Множественные"].split(/\s*,\s*/)
      end
      
      unless cart.empty?
        @cocktail["cart"] = cart
      end
    end
    
    guess_methods @cocktail
    
    cocktail_tags = @cocktail["tags"] = []
    tags = about["Теги"]
    unless tags
      error "нету поля «Теги» в описании коктейля, или поле названо неверно (например «Тег»)"
      tags = []
    end
    tags << "все коктейли"
    real_tags = tags.hash_ci_index
    tags << @cocktail["method"]
    unless real_tags[@cocktail["method"].ci_index]
      warning "в тегах нету метода «#{@cocktail["method"]}»"
    end
    
    tags << about["Крепость"]
    unless real_tags[about["Крепость"].ci_index]
      warning "в тегах нету крепости «#{about["Крепость"]}»"
    end
    
    tags = about["Группы"] + tags
    about["Группы"].each do |group|
      unless real_tags[group.ci_index]
        warning "в тегах нету группы «#{group}»"
      end
    end
    
    tags.each do |tag_candidate|
      tag = @tags_ci[tag_candidate.ci_index]
      unless tag
        error "незнакомый тег «#{tag_candidate}»"
        next
      end
      
      @tags_used[tag] = true
      cocktail_tags << tag
    end
    cocktail_tags.uniq!
    
    # find groups
    groups = @cocktail["groups"] = []
    cocktail_tags.each do |tag|
      group = @groups_ci[tag.ci_index]
      if group
        groups << group
      end
    end
    if groups.empty?
      error "не могу найти ни одной группы в тегах"
    end
    
    # find strength
    cocktail_tags.each do |tag|
      strength = @strengths_ci[tag.ci_index]
      if strength
        @cocktail["strength"] = strength
        break
      end
    end
    unless @cocktail["strength"]
      error "не могу найти крепость в тегах"
    end
    
    @cocktails[name] = @cocktail
    
    html_name = @cocktail["html_name"] = @cocktail["name_eng"].html_name
    
    dir_path = "#{Config::HTDOCS_ROOT}/#{html_name}"
    FileUtils.mkdir_p(dir_path)
    root_dir = Dir.open(dir_path)
    root_dir.name = html_name
    @cocktail["root_dir"] = root_dir
    
    update_images dir, root_dir, @cocktail unless @options[:text]
    update_html root_dir, @cocktail
    end # indent
  end
  
  def prepare_groups_and_strengths_and_methods
    @strengths = YAML::load(File.open("#{Config::COCKTAILS_DIR}/strengths.yaml"))
    @strengths_ci = @strengths.hash_ci_index
    @methods = YAML::load(File.open("#{Config::COCKTAILS_DIR}/methods.yaml"))
    @tags = YAML::load(File.open("#{Config::COCKTAILS_DIR}/known-tags.yaml"))
    @tags_ci = @tags.hash_ci_index
    @groups = YAML::load(File.open("#{Config::COCKTAILS_DIR}/groups.yaml"))
    @groups_ci = @groups.hash_ci_index
    @groups = @groups.map { |e| @tags_ci[e] }
  end
  
  def guess_methods cocktail
    methods = {}
    tools = cocktail["tools"]
    
    methods["в шейкере"] = true if tools.index("Шейкер")
    methods["давят мадлером"] = true if tools.index("Мадлер")
    methods["в блендере"] = true if tools.index("Блендер") || tools.index("Коктейльный миксер")
    methods["давят пестиком"] = true if tools.index("Пестик")
    methods["миксуют в стакане"] = true if tools.index("Стакан для смешивания")
    methods["укладывают слоями"] = true if tools.index("Стопка") && tools.index("Коктейльная ложка") && !tools.index("Кувшин") && (tools.length == 2 || tools.index("Трубочки") || tools.index("Пресс для цитруса") || tools.index("Зажигалка"))
    
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
    File.write("#{dst.path}/#{dst.name}.html", @cocktail_renderer.result(tpl.get_binding))
  end
  
  def update_json cocktail
    cocktail["added"] = cocktail["added"].to_i
    cocktail.delete("sorted_parts")
    cocktail.delete("groups")
    cocktail.delete("strength")
    
    data = {}
    root_dir = cocktail.delete("root_dir")
    @local_properties.each do |prop|
      data[prop] = cocktail.delete(prop)
    end
    
    cocktail["ingredients"].each do |part|
      part[1] = part[1].may_be_to_i
      part.pop
    end
    
    cocktail["garnish"].each do |part|
      part[1] = part[1].may_be_to_i
      part.pop
    end
    
    flush_json_object(data, "#{root_dir.path}/data.json")
  end
  
  def update_images src, dst, cocktail
    to_big     = "#{dst.path}/#{cocktail["html_name"]}-big.png"
    to_small   = "#{dst.path}/#{cocktail["html_name"]}-small.png"
    to_bg      = "#{dst.path}/#{cocktail["html_name"]}-bg.png"
    
    from_big   = "#{src.path}/big.png"
    from_small = "#{src.path}/small.png"
    from_bg    = "#{src.path}/bg.png"
    
    if File.exists?(from_big)
      flush_pngm_img(from_big, to_big)
    else
      error "не могу найти большую картинку коктейля (big.png)"
    end
    
    if File.exists?(from_small)
      unless check_img_geometry_cached(from_small, to_small) { |w, h| w == 60 && h == 80 }
        error "маленькая картинка не подходит по размеру (должна быть 60 x 80)"
        return
      end
      
      flush_pngm_img(from_small, to_small)
    else
      error "не могу найти маленькую картинку коктейля (small.png)"
    end
    
    if File.exists?(from_bg)
      flush_masked_optimized(Config::COCKTAILS_DIR + "bg_mask.png", from_bg, to_bg, "DstIn")
    else
      error "не могу найти заставку коктейля (bg.png)"
    end
  end
  
  def flush_json
    say "сохраняю данные о коктейлях"
    @cocktails.each do |name, cocktail|
      update_json cocktail
    end
    flush_json_object(@cocktails, Config::DB_JS)
  end
  
  def flush_groups_and_strengths_and_methods
     say "сохраняю списки тегов, крепости и приготовления"
     
     flush_json_object(@groups, Config::DB_JS_GROUPS)
     flush_json_object(@tags, Config::DB_JS_TAGS)
     flush_json_object(@strengths, Config::DB_JS_STRENGTHS)
     flush_json_object(@methods, Config::DB_JS_METHODS)
  end
  
  def flush_links
    File.open(Config::NOSCRIPT_LINKS, "w+") do |links|
      links.puts "<ul>"
      @cocktails.keys.sort.each do |name|
        hash = @cocktails[name]
        links.puts %Q{<li><a href="/cocktail/#{hash["name_eng"].html_name}/">#{name} (#{hash["name_eng"]})</a></li>}
      end
      links.puts "</ul>"
    end
    
    File.open(Config::SITEMAP_LINKS, "w+") do |links|
      @cocktails.each do |name, hash|
        links.puts %Q{http://#{Inshaker::DOMAIN}/cocktail/#{hash["name_eng"].html_name}/}
      end
    end
  end
  
  def cleanup_deleted
    say "ищу удаленные"
    indent do
    index = {}
    @cocktails.each do |name, cocktail|
      index[cocktail["name_eng"].html_name] = cocktail
    end
    
    Dir.new(Config::HTDOCS_ROOT).each_dir do |dir|
      unless index[dir.name]
        say "удаляю #{dir.name}"
        FileUtils.rmtree(dir.path)
      end
    end
    end # indent
  end
  
  def parse_parts parts
    parts.map do |e|
      name, amount = e.shift
      
      vol, unit = Ingredient.parse_dose(amount)
      unless vol
        if vol == nil
          error "не могу понять количество ингредиента «#{name}» в выражении «#{amount}»"
        elsif vol == false
          error "неизвестная единица измерения «#{unit}» в выражении «#{amount}»"
        end
        vol = 0.0
        unit = "хз"
      end
      
      [name, vol, unit]
    end
  end
  
  def sort_parts_by_group arr
    arr.sort do |a, b|
      @ingredient_weight_by_group[a[0]] - @ingredient_weight_by_group[b[0]]
    end
  end
  
  def merge_parts *args
    byname = {}
    
    args.each do |set|
      set.each do |part|
        name = part[0]
        
        sum = byname[name]
        if sum
          sum[1] += part[1]
        else
          byname[name] = [name, part[1], part[2]]
        end
      end
    end
    
    return byname.values
  end
private
  
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
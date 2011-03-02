#!/usr/bin/env ruby1.9
# encoding: utf-8
require "inshaker"
require "entities/cocktail"
require "entities/bar"

class BarsProcessor < Inshaker::Processor
  
  module Config
    include Bar::Config
  end
  
  def initialize
    super
    @barmen = []
    @barmen_by_name = {}
    @cases = {}
    @entities = []
    @entities_names = {}
    @entities_names_eng = {}
    @bar_points = {}
    @city_points = {}
    @cocktail_hits = {}
    @cocktail_hits_seen_first = {}
  end
  
  def job_name
    "смешивалку баров"
  end
  
  def job
    Cocktail.init
    @cocktail_hits = Cocktail.get_by_tag("Авторские хиты").map { |e| e["name"] }.hash_index
    
    prepare_barmen
    prepare_dirs
    prepare_cases
    prepare_renderer
    prepare_map_points
    
    update_bars
    
    check_intergity
    
    unless errors?
      cleanup_deleted
      flush_links
      flush_json
    end
  end
  
  def prepare_barmen
    if File.exists?(Config::BARMEN_JS)
      @barmen = load_json(Config::BARMEN_JS)
    end
    @barmen_by_name = @barmen.hash_index("name")
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::HT_ROOT]
  end
  
  def prepare_renderer
    @renderer = ERB.new(File.read(Config::TEMPLATE))
  end
  
  def prepare_cases
    @declensions = load_yaml(Config::DECLENSIONS)
  end
  
  def check_intergity
    say "проверяю хиты"
    indent do
    bar_hits = @entities.map { |e| e["carte"][0] }
    
    (@cocktail_hits.keys - bar_hits).each do |name|
      error "коктейль «#{name}» не является хитом ни в одном баре"
    end
    
    end # indent
  end
  
  def update_bars
    Dir.new(Config::BASE_DIR).each_dir do |city_dir|
      say city_dir.name
      indent do
      error "нет склонений для слова «#{city_dir.name}»" unless @declensions[city_dir.name]
      error "нет точки корода на карте" unless @city_points[city_dir.name]
      city_dir.each_dir do |bar_dir|
        say bar_dir.name
        indent do
        
        begin
          yaml = load_yaml(bar_dir.path + "/about.yaml")
        rescue ArgumentError => e
          if m = (/line (\d+)/).match(e.message)
            error "ошибка в файле about.yaml на строке " + m[1]
            next
          else
            raise e
          end
        end
        
        bar =
        {
          "name_eng" => yaml["По-английски"].to_s,
          "country" => yaml["Страна"],
          "format" => yaml["Тут можно"],
          "feel" => yaml["В компании"],
          "entrance" => yaml["Вход"],
          "cuisine" => yaml["Кухня"],
          "desc_start" => yaml["О баре"]["Заголовок"],
          "desc_end" => yaml["О баре"]["Текст"],
          "carte" => yaml["Коктейльная карта"],
          "priceIndex" => yaml["Индекс Виски-Кола"].to_s
        }
        
        unless bar["feel"].index("друзей")
          error "в этом баре нельзя выпить в компании друзей!"
        end
        
        bar["carte"].each do |cocktail|
          unless Cocktail[cocktail]
            error %Q{нет такого коктейля #{cocktail}}
          end
        end
        
        # use only one cocktail, the cocktail hit!
        cocktail_hit = bar["carte"][0]
        bar["carte"] = [cocktail_hit]
        unless @cocktail_hits[cocktail_hit]
          error "коктейль «#{cocktail_hit}» не отмечен тегом «Авторские хиты»"
        end
        if @cocktail_hits_seen_first[cocktail_hit]
          error "коктейль «#{cocktail_hit}» уже является хитом в баре «#{@cocktail_hits_seen_first[cocktail_hit]}»"
        end
        @cocktail_hits_seen_first[cocktail_hit] = bar_dir.name
        
        unless bar["name_eng"].match(/\S/)
          error "пустое имя бара: «#{bar["name_eng"]}»"
        end
        
        chief = @barmen_by_name[yaml["Главный бармен"]]
        if chief
          bar["chief"] = chief
        else
          error %Q{нет такого бармена с именем «#{yaml["Главный бармен"]}»}
        end
        
        if yaml["Контакты"]
          bar["contacts"] =
          {
            "address" => yaml["Контакты"]["Адрес"],
            "tel" => yaml["Контакты"]["Телефон"],
            "site" => yaml["Контакты"]["Сайт"],
            "hours" => yaml["Контакты"]["Часы работы"],
            "entrance" => yaml["Контакты"]["Вход"]
          }
        end
        
        if yaml["Дата открытия"]
          begin
            bar["openDate"] = Time.gm(*yaml['Дата открытия'].split(".").reverse.map{|v|v.to_i})
          rescue => e
            error "не могу понять дату «#{yaml["Дата открытия"]}»"
          end
        else
          warning "не указана дата открытия (ставлю 01.01.1970)"
          bar["openDate"] = Time.gm(1970, 1, 1)
        end
        
        bar["name"] = bar_dir.name
        bar["city"] = city_dir.name
        seen = @entities_names[bar["name"]] || @entities_names_eng[bar["name_eng"]]
        if seen
          error "бар с таким имемем уже есть в городе #{seen["city"]}"
        else
          @entities_names[bar["name"]] = bar
          @entities_names_eng[bar["name_eng"]] = bar
        end
        
        city_html_name = city_dir.name.trans.html_name
        html_name = bar["name_eng"].html_name
        bar["path"] = html_name
        
        ht_path = Config::HT_ROOT + html_name
        FileUtils.mkdir_p([ht_path])
        ht_dir = Dir.new(ht_path)
        
        update_images bar, bar_dir, ht_dir
        
        update_html bar, ht_dir
        
        unless bar["point"] = @bar_points[bar["name"]]
          error "не нашел точку на карте"
          bar["point"] = []
        end
        
        @entities << bar
        end # indent
      end
      end # indent
    end
  end
  
  def update_html bar, dst
    decl = @declensions[bar["city"]]
    city_map_name = decl ? decl[1] : bar["city"]
    File.write("#{dst.path}/index.html", @renderer.result(BarTemplate.new(bar, {"city_map_name" => city_map_name}).get_binding))
  end
  
  def update_images bar, src, dst
    mini = src.path + "/mini.jpg"
    if File.exists?(mini)
      size = File.size(mini) / 1024
      if size > 70
        error "маленькая картинка (mini.jpg) огромна (#{size}КБ > 70Кб)"
      elsif size > 25
        warning "маленькая картинка (mini.jpg) великовата (#{size}КБ > 25Кб)"
      end
      cp_if_different(mini, "#{dst.path}/mini.jpg")
    else
      error "не нашел маленькую картинку бара (mini.jpg)"
    end
    
    images = []
    src.each_rex(/^big-(\d+).jpg$/) { |img, m| images << m[1].to_i }
    
    if images.length > 0
      say "нашел #{images.length} #{images.length.items("картинку", "картинки", "картинок")}"
      
      images.sort!
      count = images[0]
      images.each do |v|
        error "большие картинки идут не по порядку" if count != v
        count += 1
      end
      
      images.each do |i|
        from = "#{src.path}/big-#{i}.jpg"
        size = File.size(from) / 1024
        if size > 120
          error "фотка №#{i} (big-#{i}.jpg) огромна (#{size}КБ > 120Кб)"
        elsif size > 70
          warning "фотка №#{i} (big-#{i}.jpg) великовата (#{size}КБ > 70Кб)"
        end
        cp_if_different(from, "#{dst.path}/photo-#{i}.jpg")
      end
      
      bar["photos"] = images.length
    else
      error "не нашел ни одной фотки бара (big-N.jpg)"
    end
  end
  
  def prepare_map_points
    rx = /<Placemark>.*?<name>(.+?)<\/name>.*?<coordinates>(-?\d+\.\d+),(-?\d+\.\d+)/m
    
    body = `curl --silent 'http://maps.google.com/maps/ms?ie=UTF8&hl=ru&msa=0&msid=107197571518206937258.000453b6fb5abcd94e9d2&output=kml'`
    bars = body.scan(rx)
    raise "не удалось скачать карту баров" if bars.empty?
    bars.each do |arr|
      @bar_points[arr[0]] = [arr[2].to_f, arr[1].to_f]
    end
    
    body = `curl --silent 'http://maps.google.com/maps/ms?ie=UTF8&hl=ru&msa=0&msid=107197571518206937258.000453b7d5de92024cf67&output=kml'`
    cities = body.scan(rx)
    throw "не удалось скачать карту городов" if cities.empty?
    cities.each do |arr|
      @city_points[arr[0]] = {"point" => [arr[2].to_f, arr[1].to_f], "zoom" => 11}
    end
  end
  
  def cleanup_deleted
    say "ищу удаленные"
    indent do
    index = {}
    @entities.each do |entity|
      index[entity["name_eng"].html_name] = entity
    end
    
    Dir.new(Config::HT_ROOT).each_dir do |dir|
      unless index[dir.name]
        say "удаляю #{dir.name}"
        FileUtils.rmtree(dir.path)
      end
    end
    end # indent
  end
  
  def flush_json
    @entities.each do |bar|
      # YAGNI
      bar.delete("desc_start")
      bar.delete("desc_end")
      bar.delete("entrance")
      bar.delete("photos")
      bar.delete("priceIndex")
      bar["openDate"] = bar["openDate"].strftime("%a, %d %b %Y %H:%M:%S GMT")
      bar["chief"] = bar["chief"]["name"]
    end
    
    flush_json_object(@entities, Config::DB_JS)
    flush_json_object(@city_points, Config::DB_JS_CITIES)
  end
  
  def flush_links
    File.open(Config::NOSCRIPT_LINKS, "w+") do |links|
      @entities.each do |entity|
        links.puts %Q{<li><a href="/bar/#{entity["path"]}/">#{entity["name"]}</a></li>}
      end
    end
    
    File.open(Config::SITEMAP_LINKS, "w+") do |links|
      @entities.each do |entity|
        links.puts %Q{http://#{Inshaker::DOMAIN}/bar/#{entity["path"]}/}
      end
    end
  end
end

exit BarsProcessor.new.run
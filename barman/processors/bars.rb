#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'
require 'uri'

class BarsProcessor < Barman::Processor
  
  module Config
    BASE_DIR       = Barman::BASE_DIR + "Bars/"
    
    HT_ROOT        = Barman::HTDOCS_DIR + "bar/"
    
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    
    DB_JS          = Barman::HTDOCS_DIR  + "db/bars.js"
    DB_JS_CITIES   = Barman::HTDOCS_DIR  + "db/cities.js"
    COCKTAILS_DB   = Barman::HTDOCS_DIR + "db/cocktails.js"
    
    ERB            = Barman::TEMPLATES_DIR + "bar.rhtml"
    DECLENSIONS    = Barman::BASE_DIR + "declensions.yaml"
  end
  
  def initialize
    super
    @cocktails = {}
    @cases = {}
    @entities = []
    @entities_names = {}
    @bar_points = {}
    @city_points = {}
  end
  
  def job_name
    "смешивалку баров"
  end
  
  def job
    prepare_cocktails
    prepare_dirs
    prepare_cases
    prepare_renderer
    prepare_map_points
    update_bars
    
    unless errors?
      flush_links
      flush_json
    end
  end
  
  def prepare_cocktails
    if File.exists?(Config::COCKTAILS_DB)
      @cocktails = load_json(Config::COCKTAILS_DB)
    end
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::HT_ROOT]
  end
  
  def prepare_renderer
    @renderer = ERB.new(File.read(Config::ERB))
  end
  
  def prepare_cases
    @declensions = load_yaml(Config::DECLENSIONS)
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
          "chief" => yaml["Главный бармен"],
          "desc_start" => yaml["О баре"]["Заголовок"],
          "desc_end" => yaml["О баре"]["Текст"],
          "carte" => yaml["Коктейльная карта"],
          "priceIndex" => yaml["Индекс Виски-Кола"].to_s
        }
        
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
        seen = @entities_names[bar["name"]]
        if seen
          error "бар с таким имемем уже есть в городе #{seen["city"]}"
        else
          @entities_names[bar["name"]] = bar
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
      if File.size(mini) > 25 * 1024
        warning "слишком большая (>25Кб) маленькая картинка (mini.jpg)"
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
        if File.size(from) > 70 * 1024
          warning "слишком большая (>70Кб) фотка №#{i} (big-#{i}.jpg)"
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
  
  def flush_json
    @entities.each do |bar|
      # YAGNI
      bar.delete("desc_start")
      bar.delete("desc_end")
      bar.delete("entrance")
      bar.delete("photos")
      bar.delete("priceIndex")
      bar["openDate"] = bar["openDate"].strftime("%a, %d %b %Y %H:%M:%S GMT")
    end
    
    flush_json_object(@entities, Config::DB_JS)
    flush_json_object(@city_points, Config::DB_JS_CITIES)
  end
  
  def flush_links
    File.open(Config::NOSCRIPT_LINKS, "w+") do |links|
      links.puts "<ul>"
      @entities.each do |entity|
        links.puts %Q{<li><a href="/bars/#{entity["city"].dirify}/#{entity["name_eng"].html_name}.html">#{entity["name"]}</a></li>}
      end
      links.puts "</ul>"
    end
  end
  
private

  def parse_about_text txt, bar
    bar["name_eng"]   = txt.scan(/.*Название:\ *\n(.+)\n.*/)[0][0]
    bar["country"]    = txt.scan(/.*Страна:\ *\n(.+)\ *\n.*/)[0][0]
    bar["address"]    = txt.scan(/.*Адрес:\ *\n(.+)\n(.+)\n(.+)?\ *\n.*/)[0]
    bar["format"]     = txt.scan(/.*Тут можно:\ *\n(.+)\n\nС кем.*/m)[0][0].split(%r{[\n\r]}).map{|e| e.trim}
    bar["feel"]       = txt.scan(/.*С кем:\ *\n(.+)\n\nВход.*/m)[0][0].split(%r{[\n\r]}).map{|e| e.trim}
    bar["entrance"]   = txt.scan(/.*Вход:\ (.+)\ *\n.*/)[0][0]
    bar["cuisine"]    = txt.scan(/.*Кухня:\ *\n(.+)\n\nГлавный бармен.*/m)[0][0].split(%r{[\n\r]})
    bar["chief"]      = txt.scan(/.*Главный бармен:\ *\n(.+)\ *\n.*/)[0][0]
    
    desc               = txt.scan(/.*О баре:\ *\n(.+)*/m)[0][0].split(%r{[\n\r]})
    bar["desc_start"] = desc.first
    bar["desc_end"]   = desc[1..-1].join("\n")
  end
  
  def parse_cocktails_text txt, bar
    begin
      blocks = txt.split("\n\n")

      carte = blocks[0].split(%r{[\n\r]})
      carte += blocks[1].split(%r{[\n\r]})
      carte.each do |name|
        unless @cocktails[name]
          error "нет такого коктейля «#{name}»"
          if name.has_diacritics
            say "пожалуйста, проверь буквы «й» и «ё» на «правильность»"
          end
        end
      end
      bar["carte"] = carte
      bar["priceIndex"] = blocks[2].split(": ")[1].trim
    rescue Exception => e
      error "ошибка в формате списка коктейлей"
    end
  end
end

exit BarsProcessor.new.run
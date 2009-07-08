#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'
# require 'lib/string_util_1.8'
# $KCODE = 'u'

class BarsProcessor < Barman::Processor
  
  module Config
    BARS_DIR   = Barman::BASE_DIR + "Bars/"
    HTDOCS_DIR = Barman::HTDOCS_DIR
    
    BARS_HTML_DIR = HTDOCS_DIR + "bars/"
    IMAGES_DIR    = HTDOCS_DIR + "i/bar"
    
    DB_JS        = HTDOCS_DIR  + "db/bars.js"
    DB_JS_CITIES = HTDOCS_DIR  + "db/cities.js"
    
    BAR_ERB = Barman::TEMPLATES_DIR + "bar.rhtml"
    DECLENSIONS = Barman::BASE_DIR + "declensions.yaml"
  end
  
  def initialize
    super
    @cases = {}
    @bars = []
    @bar  = {} # currently processed bar
    @bar_points = {}
    @city_points = {}
  end
  
  def run
    prepare_dirs
    prepare_cases
    prepare_renderer
    prepare_map_points
    update_bars
    
    flush_json
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::BARS_HTML_DIR, Config::IMAGES_DIR]
  end
  
  def prepare_renderer
    @renderer = ERB.new(File.read(Config::BAR_ERB))
  end
  
  def prepare_cases
    @declensions = YAML::load(File.open(Config::DECLENSIONS))
  end
  
  def update_bars
    Dir.new(Config::BARS_DIR).each_dir do |city_dir|
      say city_dir.name
      error "нет склонений для слова «#{city_dir.name}»" unless @declensions[city_dir.name]
      indent do
      Dir.new(city_dir.path).each_dir do |bar_dir|
        say bar_dir.name
        indent do
        
        @bar = {}
        @bar["name"] = bar_dir.name
        @bar["city"] = city_dir.name
        parse_about_text(File.read(bar_dir.path + "/about.txt"), @bar)
        parse_cocktails_text(File.read(bar_dir.path + "/cocktails.txt"), @bar)
        
        city_html_name = city_dir.name.trans.html_name
        city_map_name = @declensions[city_dir.name][1]
        html_name = @bar["name_eng"].html_name
        
        
        # картинки
        out_images_path = "#{Config::IMAGES_DIR}/#{city_html_name}/#{html_name}"
        FileUtils.mkdir_p out_images_path
        
        mini = bar_dir.path + "/mini.jpg"
        if File.exists?(mini)
          if File.size(mini) > 25 * 1024
            warning "слишком большая (>25Кб) маленькая картинка (mini.jpg)"
          end
          FileUtils.cp_r(mini, "#{out_images_path}/mini.jpg", @mv_opt)
        else
          error "не нашел маленькую картинку бара (mini.jpg)"
        end
        
        @bar["big_images"] = []
        images = []
        bar_dir.each_rex(/^big-(\d+).jpg$/) { |img, m| images << m[1].to_i }
        if images.length > 0
          say "нашел #{images.length} #{images.length.items("картинку", "картинки", "картинок")}"
          images.sort.each do |i|
            from = "#{bar_dir.path}/big-#{i}.jpg"
            if File.size(from) > 70 * 1024
              warning "слишком большая (>70Кб) фотка №#{i} (big-#{i}.jpg)"
            end
            FileUtils.cp_r(from, "#{out_images_path}/photo-#{i}.jpg", @mv_opt)
            @bar["big_images"] << "/i/bar/#{city_html_name}/#{html_name}/photo-#{i}.jpg"
          end
        else
          error "не нашел ни одной фотки бара (big-N.jpg)"
        end
        
        
        # html
        out_html_path = Config::BARS_HTML_DIR + city_html_name
        FileUtils.mkdir_p out_html_path
        File.write("#{out_html_path}/#{html_name}.html", @renderer.result(BarTemplate.new(@bar, {"city_map_name" => city_map_name}).get_binding))
        
        
        
        @bar["point"] = @bar_points[@bar["name"]] || []
        
        @bars << @bar
        end # indent
      end
      end # indent
    end
  end
    
  def prepare_map_points
    rx = Regexp.new(/<Placemark>.*?<name>(.+?)<\/name>.*?<coordinates>(\d+\.\d+),(\d+\.\d+)/m)
    
    body_str = `curl --silent 'http://maps.google.com/maps/ms?ie=UTF8&hl=ru&msa=0&msid=107197571518206937258.000453b6fb5abcd94e9d2&output=kml'`
    points_arrs = body_str.scan(rx)
    points_arrs.each {|arr| @bar_points[arr[0]] = [arr[2].to_f, arr[1].to_f]}
    
    
    body_str = `curl --silent 'http://maps.google.com/maps/ms?ie=UTF8&hl=ru&msa=0&msid=107197571518206937258.000453b7d5de92024cf67&output=kml'`
    points_arrs = body_str.scan(rx)
    points_arrs.each {|arr| @city_points[arr[0]] = {"point" => [arr[2].to_f, arr[1].to_f], "zoom" => 11}}
  end
  
  def flush_json
    @bars.each do |bar|
      # YAGNI
      bar.delete("desc_start")
      bar.delete("desc_end")
      bar.delete("big_images")
    end
    
    flush_json_object(@bars, Config::DB_JS)
    flush_json_object(@city_points, Config::DB_JS_CITIES)
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
    blocks = txt.split("\n\n")
    bar["recs"]  = blocks[0].split(%r{[\n\r]})
    bar["carte"] = blocks[1].split(%r{[\n\r]})
    bar["priceIndex"] = blocks[2].split(": ")[1].trim
  end
end

BarsProcessor.new.run

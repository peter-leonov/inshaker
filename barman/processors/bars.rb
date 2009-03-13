#!/usr/bin/ruby
require 'barman'

class BarsProcessor < Barman::Processor
  
  module Config
    BARS_DIR   = Barman::BASE_DIR + "Bars/"
    HTDOCS_DIR = Barman::HTDOCS_DIR
    
    BARS_HTML_DIR = HTDOCS_DIR + "bars/"
    IMAGES_DIR    = HTDOCS_DIR + "i/bar/"

    DB_JS        = HTDOCS_DIR  + "db/bars.js"
    DB_JS_CITIES = HTDOCS_DIR  + "db/cities.js"

    BAR_ERB = Barman::TEMPLATES_DIR + "bar.rhtml"
  end
  
  def initialize
    super   
    @bars = {}
    @bar  = {} # currently processed bar
    @bar_points = {}
    @city_points = {}
  end
  
  def run
    prepare_map_points
    prepare_bars
    
    flush_images
    flush_html
    flush_json
  end
  
  def prepare_bars
    root_dir = Dir.new(Config::BARS_DIR)
    root_dir.each do |city_dir|
      city_path = root_dir.path + city_dir
      if File.ftype(city_path) == "directory" and !@excl.include?(city_dir)
        @bars[city_dir] = []
        puts city_dir
        bars_dir = Dir.new(city_path)
        bars_dir.each do |bar_dir|
          bar_path = bars_dir.path + "/" + bar_dir
          if File.ftype(bar_path) == "directory" and !@excl.include?(bar_dir)
            puts ".." + bar_dir
            
            @bar = {}
            parse_about_text     File.open(bar_path + "/about.txt").read
            parse_cocktails_text File.open(bar_path + "/cocktails.txt").read
            detect_big_images bar_path
            @bar[:point] = @bar_points[@bar[:name]] || []
            @bars[city_dir] << @bar
          end
        end
      end
    end
  end
  
  def flush_images
    @bars.each do |city, bars_arr|
      bars_arr.each do |bar|
        bar_path = Config::BARS_DIR + city + "/" + bar[:name] + "/"
        out_images_path = Config::IMAGES_DIR + city.trans.html_name
        if !File.exists? out_images_path then FileUtils.mkdir_p out_images_path end
        
        if File.exists?(bar_path + "mini.jpg")
          FileUtils.cp_r(bar_path + "mini.jpg", out_images_path + "/" + bar[:name_eng].html_name + "-mini.jpg", @mv_opt)
        end
        
        counter = 1
        while File.exists?(bar_path + "big-#{counter}.jpg")
          FileUtils.cp_r(bar_path + "big-#{counter}.jpg", out_images_path + "/" + bar[:name_eng].html_name + "-big-#{counter}.jpg", @mv_opt)
          counter +=1
        end
      end
    end
  end
  
  def flush_html
    template = File.open(Config::BAR_ERB).read
    renderer = ERB.new(template)
    @bars.each do |city, bars_arr|
      bars_arr.each do |bar|
        out_html_path = Config::BARS_HTML_DIR + city.trans.html_name
        if !File.exists? out_html_path then FileUtils.mkdir_p out_html_path end
        bar_erb = BarTemplate.new(bar)
        File.open(out_html_path + "/" + bar[:name_eng].html_name + ".html", "w+") do |html|
          html.write renderer.result(bar_erb.get_binding)
        end
      end
    end
  end
  
  def prepare_map_points
    rx = Regexp.new(/<Placemark>.*?<name>(.+?)<\/name>.*?<coordinates>(\d+\.\d+),(\d+\.\d+)/m)
    
    c = Curl::Easy.new("http://maps.google.com/maps/ms?ie=UTF8&hl=ru&msa=0&msid=107197571518206937258.000453b6fb5abcd94e9d2&output=kml")
    c.http_get
    points_arrs = c.body_str.scan(rx)
    points_arrs.each {|arr| @bar_points[arr[0]] = [arr[2].to_f, arr[1].to_f]}
    
    c = Curl::Easy.new("http://maps.google.com/maps/ms?ie=UTF8&hl=ru&msa=0&msid=107197571518206937258.000453b7d5de92024cf67&output=kml")
    c.http_get
    points_arrs = c.body_str.scan(rx)
    points_arrs.each {|arr| @city_points[arr[0]] = {:point => [arr[2].to_f, arr[1].to_f], :zoom => 11}}
  end
  
  def flush_json
    @bars.each do |city, bars_arr|
      bars_arr.each do |bar|
        # YAGNI
        bar.delete(:desc_start)
        bar.delete(:desc_end) 
        bar.delete(:city) 
     end
    end
    
    flush_json_object({:db => @bars, :opts => {}}, Config::DB_JS)
    flush_json_object(@city_points, Config::DB_JS_CITIES)
  end
  
private

  def detect_big_images bar_path
    @bar[:big_images] = []
    counter = 1
    while File.exists?(bar_path + "/big-#{counter}.jpg")
      @bar[:big_images] << "/i/bar/" + @bar[:city].trans.html_name + "/" + @bar[:name_eng].html_name + "-big-#{counter}.jpg"
      counter += 1
    end
  end

  def parse_about_text(txt)
    @bar[:name], @bar[:name_eng] = ((txt.scan /.*Название:\ *\n(.+)\n.*/)[0][0]).split("; ").map { |nm| nm = nm.yi }
    @bar[:country]  = (txt.scan /.*Страна:\ *\n(.+)\ *\n.*/)[0][0]
    @bar[:city]     = (txt.scan /.*Город:\ *\n(.+)\ *\n.*/)[0][0]
    @bar[:address]  = (txt.scan /.*Адрес:\ *\n(.+)\n(.+)\n(.+)?\ *\n.*/)[0]
    @bar[:format]   = (txt.scan /.*Тут можно:\ *\n(.+)\n\nС кем.*/m)[0][0].split(%r{[\n\r]}).map{|e| e.trim.downcase}
    @bar[:feel]     = (txt.scan /.*С кем:\ *\n(.+)\n\nВход.*/m)[0][0].split(%r{[\n\r]}).map{|e| e.trim.downcase}
    @bar[:entrance] = (txt.scan /.*Вход:\ (.+)\ *\n.*/)[0][0]
    @bar[:cuisine]  = (txt.scan /.*Кухня:\ *\n(.+)\n\nГлавный бармен.*/m)[0][0].split(%r{[\n\r]})
    @bar[:chief]    = (txt.scan /.*Главный бармен:\ *\n(.+)\ *\n.*/)[0][0]
    
                 desc = (txt.scan /.*О баре:\ *\n(.+)*/m)[0][0].split(%r{[\n\r]})
    @bar[:desc_start] = desc.first
    @bar[:desc_end]   = desc[1..-1].join "\n"

  end
  
  def parse_cocktails_text(txt)
    blocks = txt.split("\n\n")
    @bar[:recs]  = blocks[0].split(%r{[\n\r]})
    @bar[:carte] = blocks[1].split(%r{[\n\r]})
    @bar[:price_index] = blocks[2].split(": ")[1]
  end
end

BarsProcessor.new.run

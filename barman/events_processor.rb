#!/usr/bin/ruby

require 'rubygems'
require 'lib/active_support_pmc'
require 'unicode'
require 'fileutils'
require 'erb'
require 'lib/string_util'
require 'templates'
require 'yaml'

$KCODE = 'u'

class EventsProcessor
  
  
  module Config
    INSHAKER_ROOT = "/www/inshaker/"
    SRC_DIR = ENV['BARMAN_BASE_DIR'] ? ENV['BARMAN_BASE_DIR'] + 'Events/' : INSHAKER_ROOT + "barman/base/Events/"
    SRC_ERB = INSHAKER_ROOT + "barman/templates/event.rhtml"
    
    OUT_ROOT       = INSHAKER_ROOT + "htdocs/"
    OUT_HTML_DIR   = OUT_ROOT + "events/"
    OUT_IMAGES_DIR = OUT_ROOT + "i/event/"
    
    OUT_JS_DB        = OUT_ROOT + "db/events.js"
    
    MV_OPT = {:remove_destination => true}
  end
  
  
  def initialize    
    @entities = {}
    @entity  = {} # currently processed bar
  end
  
  def run
    prepare_entities
    
    # flush_images
    flush_html
    flush_json
  end
  
  def prepare_entities
    excluded = [".", "..", ".svn", ".TemporaryItems", ".DS_Store"]
    
    root_dir = Dir.new(Config::SRC_DIR)
    root_dir.each do |city_dir|
      city_path = root_dir.path + city_dir
      if File.ftype(city_path) == "directory" and !excluded.include?(city_dir)
        # @entities[city_dir] = []
        puts city_dir
        entities_dir = Dir.new(city_path)
        entities_dir.each do |entity_dir|
          entity_path = entities_dir.path + "/" + entity_dir
          if File.ftype(entity_path) == "directory" and !excluded.include?(entity_dir)
            puts ".." + entity_dir
            
            @entity = {}
            parse_about     YAML::load(File.open(entity_path + "/about.yaml"))
            # detect_big_images bar_path
            # @entities[city_dir] << @entity
            @entities[@entity[:name]] = @entity
          end
        end
      end
    end
  end
  
  def flush_images
    @bars.each do |city, bars_arr|
      bars_arr.each do |bar|
        bar_path = BarsConfig::BARS_DIR + city + "/" + bar[:name] + "/"
        out_images_path = BarsConfig::OUT_IMAGES_DIR + city.trans.html_name
        if !File.exists? out_images_path then FileUtils.mkdir_p out_images_path end
        
        if File.exists?(bar_path + "mini.png")
          FileUtils.cp_r(bar_path + "mini.png", out_images_path + "/" + bar[:name_eng].html_name + "-mini.png", BarsConfig::MV_OPT)
        end
        
        counter = 1
        while File.exists?(bar_path + "big-#{counter}.jpg")
          FileUtils.cp_r(bar_path + "big-#{counter}.jpg", out_images_path + "/" + bar[:name_eng].html_name + "-big-#{counter}.jpg", BarsConfig::MV_OPT)
          counter +=1
        end
      end
    end
  end
  
  def flush_html
    template = File.open(Config::SRC_ERB).read
    renderer = ERB.new(template)
    @entities.each do |name, entity|
      # warn entity
      out_html_path = Config::OUT_HTML_DIR + entity[:city].trans.html_name
      if !File.exists? out_html_path then FileUtils.mkdir_p out_html_path end
      bar_erb = EventTemplate.new(entity)
      File.open(out_html_path + "/" + entity[:href].html_name + ".html", "w+") do |html|
        html.write renderer.result(bar_erb.get_binding)
      end
    end
  end
  
  def flush_json
    @entities.each do |name, entity|
      # YAGNI
      entity.delete(:name)
      entity.delete(:header)
      entity.delete(:subject)
    end
    
    entities_json = ActiveSupport::JSON.encode(@entities) #, {:escape => false})
    # warn entities_json
    File.open(Config::OUT_JS_DB, "w+") do |db|
     db.print entities_json
    end
  end
  
private
  def parse_about(yaml)
    # warn yaml.inspect
    @entity[:name]      = yaml['Название']
    @entity[:header]    = yaml['Слоган']
    @entity[:subject]   = yaml['Задача']
    @entity[:city]      = yaml['Город']
    @entity[:country]   = yaml['Страна']
    @entity[:href]      = yaml['Ссылка']
    @entity[:address]   = yaml['Адрес']
    @entity[:bar]       = yaml['Бар']
    @entity[:fields]    = yaml['Поля формы']
    # @entity[:high]      = yaml['Генеральные спонсоры']
    # @entity[:medium]    = yaml['Спонсоры']
    # @entity[:low]       = yaml['При поддержке']
    @entity[:rating]    = {}
    
    arr = []
    yaml['Генеральные спонсоры'].each do |sponsor|
      arr << {:name => sponsor[0], :src => sponsor[1], :href => sponsor[2]}
    end
    @entity[:high] = arr
    
    arr = []
    yaml['Спонсоры'].each do |sponsor|
      arr << {:name => sponsor[0], :src => sponsor[1], :href => sponsor[2]}
    end
    @entity[:medium] = arr
    
    low = []
    yaml['При поддержке'].each do |name, logos|
      arr = []
      low << sponsor = {:name => name, :logos => arr}
	    logos.each do |sponsor|
	      arr << {:name => sponsor[0], :src => sponsor[1], :href => sponsor[2]}
	    end
	    
      # arr << {:name => sponsor[0], :src => sponsor[1], :href => sponsor[2]}
    end
    @entity[:low] = low
    
  end
end


EventsProcessor.new.run

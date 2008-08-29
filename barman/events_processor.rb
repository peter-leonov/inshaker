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
            parse_about  entity_path
            process_images entity_path
            # @entities[city_dir] << @entity
            @entities[@entity[:name]] = @entity
          end
        end
      end
    end
  end
  
  def process_images src_dir
    @entity[:imgdir] = '/i/event/' + @entity[:city].trans.html_name + "/" + @entity[:href]
    out_images_path = Config::OUT_IMAGES_DIR + @entity[:city].trans.html_name + "/" + @entity[:href]
    if !File.exists? out_images_path then FileUtils.mkdir_p out_images_path end
    
    if File.exists?(src_dir + "/promo-bg.png")
      @entity[:promo] = 1
      FileUtils.cp_r(src_dir + "/promo-bg.png", out_images_path + "/promo-bg.png", Config::MV_OPT)
    end
    
    @entity[:dialogue].each do |v|
      FileUtils.mkdir_p out_images_path + "/dialogues/"
      FileUtils.cp_r(src_dir + "/dialogues/" + v[:back], out_images_path + "/dialogues/" + v[:back], Config::MV_OPT)
      FileUtils.cp_r(src_dir + "/dialogues/" + v[:popups], out_images_path + "/dialogues/" + v[:popups], Config::MV_OPT)
    end
    
    # 
    # counter = 1
    # while File.exists?(bar_path + "big-#{counter}.jpg")
    #   FileUtils.cp_r(bar_path + "big-#{counter}.jpg", out_images_path + "/" + bar[:name_eng].html_name + "-big-#{counter}.jpg", Config::MV_OPT)
    #   counter +=1
    # end
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
      entity.delete(:promo)
      entity.delete(:imgdir)
      entity.delete(:target)
    end
    
    entities_json = ActiveSupport::JSON.encode(@entities, {:escape => false})
    # warn entities_json
    File.open(Config::OUT_JS_DB, "w+") do |db|
     db.print entities_json
    end
  end
  
private
  def parse_about src_dir
    
    yaml = YAML::load(File.open(src_dir + "/about.yaml"))
    
    # warn yaml.inspect
    @entity[:name]      = yaml['Название']
    @entity[:header]    = yaml['Слоган']
    @entity[:target]    = yaml['Задача']
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
    
    out_images_path = Config::OUT_IMAGES_DIR + @entity[:city].trans.html_name + "/" + @entity[:href]
    
    arr = []
    yaml['Диалоги'].each do |v|
      arr << {:back => v[0], :popups => v[1]}
    end
    @entity[:dialogue] = arr
    
    FileUtils.mkdir_p out_images_path + "/logos/"
    
    arr = []
    yaml['Генеральные спонсоры'].each do |v|
      hash = {:name => v[0], :src => v[1], :href => v[2]}
      arr << hash
      FileUtils.cp_r(src_dir + "/logos/" + hash[:src], out_images_path + "/logos/" + hash[:src], Config::MV_OPT)
    end
    @entity[:high] = arr
    
    arr = []
    yaml['Спонсоры'].each do |v|
      hash = {:name => v[0], :src => v[1], :href => v[2]}
      arr << hash
      FileUtils.cp_r(src_dir + "/logos/" + hash[:src], out_images_path + "/logos/" + hash[:src], Config::MV_OPT)
    end
    @entity[:medium] = arr
    
    low = []
    yaml['При поддержке'].each do |v|
      name, logos = v['Название'], v['Логотипы']
      arr = []
      low << {:name => name, :logos => arr}
	    logos.each do |sponsor|
	      hash = {:name => sponsor[0], :src => sponsor[1], :href => sponsor[2]}
	      arr << hash
	      FileUtils.cp_r(src_dir + "/logos/" + hash[:src], out_images_path + "/logos/" + hash[:src], Config::MV_OPT)
	    end
	    
      # arr << {:name => sponsor[0], :src => sponsor[1], :href => sponsor[2]}
    end
    @entity[:low] = low
  end
end


EventsProcessor.new.run

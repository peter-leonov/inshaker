#!/usr/bin/ruby
require 'barman'

class EventsProcessor < Barman::Processor
  
  module Config
    EVENTS_DIR = Barman::BASE_DIR + "Events/"
    HTDOCS_DIR = Barman::HTDOCS_DIR
    
    EVENTS_HTML_DIR = HTDOCS_DIR + "events/"
    IMAGES_DIR      = HTDOCS_DIR + "i/event/"
    
    DB_JS = HTDOCS_DIR + "db/events.js"
    
    EVENT_ERB = Barman::TEMPLATES_DIR + "event.rhtml"
  end
  
  
  def initialize
    super
    @entities = {}
    @entity  = {} # currently processed bar
  end
  
  def run
    prepare_dirs
    prepare
    
    flush_html
    flush_json
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::EVENTS_HTML_DIR, Config::IMAGES_DIR]
  end
  
  def prepare
    root_dir = Dir.new(Config::EVENTS_DIR)
    root_dir.each do |city_dir|
      city_path = root_dir.path + city_dir
      if File.ftype(city_path) == "directory" and !@excl.include?(city_dir)
        # @entities[city_dir] = []
        puts city_dir
        entities_dir = Dir.new(city_path)
        entities_dir.each do |entity_dir|
          entity_path = entities_dir.path + "/" + entity_dir
          if File.ftype(entity_path) == "directory" and !@excl.include?(entity_dir)
            puts ".." + entity_dir
            
            @entity = {}
            parse_about  entity_path
            process_images entity_path
            process_rating entity_path
            # @entities[city_dir] << @entity
            @entities[@entity[:name]] = @entity
          end
        end
      end
    end
  end
  
  def process_images src_dir
    @entity[:imgdir] = '/i/event/' + @entity[:city].trans.html_name + "/" + @entity[:href]
    out_images_path = Config::IMAGES_DIR + @entity[:city].trans.html_name + "/" + @entity[:href]
    if !File.exists? out_images_path then FileUtils.mkdir_p out_images_path end
    
    if File.exists?(src_dir + "/promo-bg.png")
      @entity[:promo] = 1
      FileUtils.cp_r(src_dir + "/promo-bg.png", out_images_path + "/promo-bg.png", @mv_opt)
    end
    
    if File.exists?(src_dir + "/preview.jpg")
      FileUtils.cp_r(src_dir + "/preview.jpg", out_images_path + "/preview.jpg", @mv_opt)
    end
    
    @entity[:dialogue].each do |v|
      FileUtils.mkdir_p out_images_path + "/dialogues/"
      FileUtils.cp_r(src_dir + "/dialogues/" + v[:back], out_images_path + "/dialogues/" + v[:back], @mv_opt)
      FileUtils.cp_r(src_dir + "/dialogues/" + v[:popups], out_images_path + "/dialogues/" + v[:popups], @mv_opt)
    end
  end
  
  def flush_html
    template = File.open(Config::EVENT_ERB).read
    renderer = ERB.new(template)
    @entities.each do |name, entity|
      # warn entity
      out_html_path = Config::EVENTS_HTML_DIR + entity[:city].trans.html_name
      if !File.exists? out_html_path then FileUtils.mkdir_p out_html_path end
      erb = EventTemplate.new(entity)
      File.open(out_html_path + "/" + entity[:href].html_name + ".html", "w+") do |html|
        html.write renderer.result(erb.get_binding)
      end
    end
  end
  
  def flush_json
    @entities.each do |name, entity|
      # YAGNI
      entity.delete(:subject)
      entity.delete(:promo)
      entity.delete(:imgdir)
    end
    
    flush_json_object(@entities, Config::DB_JS)
  end
  
private
  def parse_about src_dir
    
    yaml = YAML::load(File.open(src_dir + "/about.yaml"))
    
    # warn yaml.inspect
    ru_date             = Time.gm(*yaml['Дата'].split(".").reverse.map{|v|v.to_i})
    ru_date_str         = "#{ru_date.day} #{Date::RU_INFLECTED_MONTHNAMES[ru_date.mon].downcase} #{ru_date.year}"
    @entity[:date]      = ru_date.to_i * 1000
    
    @entity[:name]      = yaml['Название']
    @entity[:header]    = yaml['Слоган']
    @entity[:target]    = yaml['Задача']
    @entity[:subject]   = yaml['Задача']
    @entity[:city]      = yaml['Город']
    @entity[:country]   = yaml['Страна']
    @entity[:href]      = yaml['Ссылка']
    @entity[:venue]     = yaml['Место']
    @entity[:time]      = yaml['Время']
    @entity[:enter]     = yaml['Вход']
    @entity[:photos]    = yaml['Ссылка на фотки']
    @entity[:fields]    = yaml['Поля формы']
    @entity[:form_hint] = yaml['Подсказка в форме']
    @entity[:status]    = {'подготовка' => 'preparing', 'проведение' => 'holding'}[yaml['Статус']]
    
    @entity[:date_ru]      = ru_date_str
    @entity[:address]   = yaml['Ссылка на место']
    
    # @entity[:high]      = yaml['Генеральные спонсоры']
    # @entity[:medium]    = yaml['Спонсоры']
    # @entity[:low]       = yaml['При поддержке']
    @entity[:rating]    = {}
    
    out_images_path = Config::IMAGES_DIR + @entity[:city].trans.html_name + "/" + @entity[:href]
    
    arr = []
    yaml['Диалоги'].each do |v|
      arr << {:back => v[0], :popups => v[1]}
    end
    @entity[:dialogue] = arr
    
    FileUtils.mkdir_p out_images_path + "/logos/"
    
    arr = []
    if yaml['Генеральные спонсоры']
      yaml['Генеральные спонсоры'].each do |v|
        hash = {:name => v[0], :src => v[1], :href => v[2]}
        arr << hash
        FileUtils.cp_r(src_dir + "/logos/" + hash[:src], out_images_path + "/logos/" + hash[:src], @mv_opt)
      end
    end
    @entity[:high] = arr
    
    arr = []
    if yaml['Спонсоры']
      yaml['Спонсоры'].each do |v|
        hash = {:name => v[0], :src => v[1], :href => v[2]}
        arr << hash
        FileUtils.cp_r(src_dir + "/logos/" + hash[:src], out_images_path + "/logos/" + hash[:src], @mv_opt)
      end
    end
    @entity[:medium] = arr
    
    low = []
    if yaml['При поддержке']
      yaml['При поддержке'].each do |v|
        name, logos = v['Название'], v['Логотипы']
        arr = []
        low << {:name => name, :logos => arr}
        logos.each do |sponsor|
          hash = {:name => sponsor[0], :src => sponsor[1], :href => sponsor[2]}
          arr << hash
          FileUtils.cp_r(src_dir + "/logos/" + hash[:src], out_images_path + "/logos/" + hash[:src], @mv_opt)
        end
        
        # arr << {:name => sponsor[0], :src => sponsor[1], :href => sponsor[2]}
      end
    end
    @entity[:low] = low
    
    rating = yaml['Рейтинг']
    @entity[:rating] = {:phrase => rating['Фраза'], :max => rating['Выводить']}
  end
  
  def process_rating src_dir
    fname_rating      = src_dir + "/rating.csv"
    fname_substitute  = src_dir + "/substitute.csv"
    rating = {}
    substitute = {}
    unknown = []
    doubles = []
    uniq = {}
    if File.exists? fname_rating and File.exists? fname_substitute
      csv_rating = CSV::parse(File.open(fname_rating).read)
      csv_substitute = CSV::parse(File.open(fname_substitute).read)
      csv_substitute.each do |v|
        substitute[v[0]] = v[1]
      end
      csv_rating.shift
      i = 0
      csv_rating.each do |line|
        i += 1
        v = line[0]
        
        if uniq[v]
          doubles << "#{i}: #{v}"
          next
        end
        uniq[v] = true
        
        m = /\@(\S+)/.match v
        if m then
          bank = substitute[m[1]]
          if bank then
            unless /^\s*!\s*$/.match(bank) then
              rating[bank] = rating[bank] ? rating[bank] + 1 : 1
            end
          else
            unknown << "#{i}: #{m[1]}"
          end
        else
          puts "  #{i}: Не могу понять email: '#{v}'"
        end
      end
      
      puts "  Неизвестные банки:\n  " + unknown.join("\n  ") unless unknown.empty?
      puts "\n  Повторяющиеся адреса:\n  " + doubles.join("\n  ") unless doubles.empty?
    end
    
    @entity[:rating][:data] = rating
    
    # warn @entity[:rating].inspect
  end
  
end

EventsProcessor.new.run
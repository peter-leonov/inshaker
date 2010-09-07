#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require "barman"
require "lib/csv"

class EventsProcessor < Barman::Processor
  
  module Config
    BASE_DIR       = Barman::BASE_DIR + "Events/"
    
    HT_ROOT        = Barman::HTDOCS_DIR + "event/"
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    MAIN_LINK      = HT_ROOT + "main-%s.html"
    
    DB_JS          = Barman::HTDOCS_DIR + "db/events.js"
    
    TEMPLATES      = Barman::TEMPLATES_DIR
  end
  
  
  def initialize
    super
    @entities = {}
    @entities_array = []
    @entities_hrefs = {}
    @entity  = {} # currently processed bar
    @type_names = {'amateur' => 'для любителей', 'pro' => 'для профессионалов'}
    @type_main = {}
  end
  
  def job_name
    "смешивалку событий"
  end
  
  def job
    prepare_dirs
    
    update_events
    
    unless errors?
      update_main
      cleanup_deleted
      flush_links
      flush_json
    end
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::HT_ROOT]
  end
  
  def update_events
    Dir.new(Config::BASE_DIR).each_dir do |city_dir|
      say city_dir.name
      indent do
      city_dir.each_dir do |entity_dir|
        process_entity entity_dir
      end
      end # indent
    end
  end
  
  def process_entity src_dir
    say src_dir.name
    indent do
    
    @entity = {}
    
    yaml = YAML::load(File.open(src_dir.path + "/about.yaml"))
    
    # warn yaml.inspect
    ru_date             = Time.gm(*yaml['Дата'].split(".").reverse.map{|v|v.to_i})
    ru_date_str         = "#{ru_date.day} #{Date::RU_INFLECTED_MONTHNAMES[ru_date.mon].downcase} #{ru_date.year}"
    @entity["date"]      = ru_date.to_i * 1000
    @entity["lang"]      = {'английский' => 'en', nil => 'ru', 'русский' => 'ru'}[yaml['Язык']]
    
    if yaml['Главное событие'] == "да"
      @entity["main"] = true
    end
    
    @entity["adate"]             = yaml['Примерная дата']
    @entity["name"]              = yaml['Название']
    @entity["header"]            = yaml['Слоган']
    @entity["target"]            = yaml['Задача']
    @entity["subject"]           = yaml['Задача']
    @entity["city"]              = yaml['Город']
    @entity["country"]           = yaml['Страна']
    @entity["href"]              = yaml['Ссылка']
    @entity["venue"]             = yaml['Место']
    @entity["time"]              = yaml['Время']
    @entity["enter"]             = yaml['Вход']
    @entity["photos"]            = yaml['Ссылка на фотки']
    @entity["fields"]            = yaml['Поля формы']
    @entity["form_hint"]         = yaml['Подсказка в форме']
    @entity["sent_message"]      = yaml['Сообщение в форме после отправки']
    @entity["sent_message_en"]   = yaml['Сообщение в форме после отправки (англ.)']
    @entity["status"]            = {'подготовка' => 'preparing', 'проведение' => 'holding', 'архив' => 'archive' }[yaml['Статус']]
    
    @entity["date_ru"]           = ru_date_str
    @entity["address"]           = yaml['Ссылка на место']
    
    @entity["rating"]            = {}
    
    @entity["type"]              = {'для любителей' => 'amateur', 'для профессионалов' => 'pro', nil => 'pro'}[yaml['Тип']]
    unless @entity["type"]
      error %Q{непонятный тип события «#{yaml['Тип']}»}
    end
    
    if @entity["main"]
      main_event = @type_main[@entity["type"]]
      if main_event
        error %Q{главным событием #{@type_names[@entity["type"]]} уже назначено "#{main_event["name"]}"}
      else
        @type_main[@entity["type"]] = @entity
      end
    end
    
    fields = []
    if @entity["fields"]
      @entity["fields"].each do |label|
        if label.class == Hash
          field = {"label" => label["Название"]}
          if label["Подсказка"]
            field["tip"] = label["Подсказка"]
          end
          if label["Столбец"]
            field["name"] = label["Столбец"]
          end
          fields << field
        else
          fields << {"label" => label.to_s}
        end
      end
    end
    @entity["fields"] = fields
    
    seen = @entities_hrefs[@entity["href"]]
    if seen
      error %Q{событие с такой ссылкой уже существует: "#{seen["name"]}"}
    else
      @entities_hrefs[@entity["href"]] = @entity
    end
    
    ht_path = Config::HT_ROOT + @entity["href"]
    FileUtils.mkdir_p ht_path
    ht_dir = Dir.new(ht_path)
    
    arr = []
    if yaml['Диалоги']
      yaml['Диалоги'].each do |v|
        arr << {"back" => v[0], "popups" => v[1] == "нет" ? nil : v[1]}
      end
    end
    @entity["dialogue"] = arr
    
    FileUtils.mkdir_p ht_dir.path + "/logos/"
    
    arr = []
    if yaml['Генеральные спонсоры']
      yaml['Генеральные спонсоры']['Баннеры'].each do |v|
        hash = {"name" => v[0], "src" => v[1], "href" => v[2]}
        arr << hash
        FileUtils.cp_r(src_dir.path + "/logos/" + hash["src"], ht_dir.path + "/logos/" + hash["src"], @mv_opt)
      end
      @entity["high_head"] = yaml['Генеральные спонсоры']['Заголовок']
      if @entity["high_head"] == 'нет'
        @entity["high_head"] = nil
      end
    end
    @entity["high"] = arr
    
    arr = []
    if yaml['Спонсоры']
      yaml['Спонсоры'].each do |v|
        hash = {"name" => v[0], "src" => v[1], "href" => v[2]}
        arr << hash
        FileUtils.cp_r(src_dir.path + "/logos/" + hash["src"], ht_dir.path + "/logos/" + hash["src"], @mv_opt)
      end
    end
    @entity["medium"] = arr
    
    low = []
    if yaml['При поддержке']
      yaml['При поддержке'].each do |v|
        name, logos = v['Название'], v['Логотипы']
        arr = []
        low << {"name" => name, "logos" => arr}
        logos.each do |sponsor|
          if sponsor == "заглушка"
            hash = nil
          else
            hash = {"name" => sponsor[0], "src" => sponsor[1], "href" => sponsor[2]}
            FileUtils.cp_r(src_dir.path + "/logos/" + hash["src"], ht_dir.path + "/logos/" + hash["src"], @mv_opt)
          end
          arr << hash
        end
      end
    end
    @entity["low"] = low
    
    rating = yaml['Рейтинг']
    if rating
      say "нашел рейтинг"
      data = {"phrase" => rating['Фраза'], "max" => rating['Выводить']}
      @entity["rating"] = data
      
      type = {'корпоративный' => 'corp', 'соревнование' => 'comp'}[rating['Тип']]
      if type
        data["type"] = type
      end
      
      if rating['В обратном порядке'] == 'да'
        data["reverse"] = true
      end
      
      process_rating src_dir
    end
    
    update_images src_dir, ht_dir
    update_html @entity, ht_dir
    end # indent
    
    @entities[@entity["name"]] = @entity
    @entities_array << @entity
  end
  
  def update_main
    @type_names.each do |k, v|
      main_event = @type_main[k]
      if main_event
        say %Q{главное событие #{v}: "#{main_event["name"]}"}
        File.write(Config::MAIN_LINK % k, %Q{/event/#{main_event["href"]}/})
      else
        error "ни одно событие #{v} не назначено главным"
      end
    end
  end
  
  def process_rating src_dir
    fname_rating      = src_dir.path + "/rating.csv"
    fname_substitute  = src_dir.path + "/substitute.csv"
    rating = {}
    substitute = {}
    seen = {}
    type = @entity["rating"]["type"]
    if File.exists? fname_rating and File.exists? fname_substitute
      CSV.foreach_hash fname_substitute do |row, line|
        substitute[row["value"]] = row["name"]
      end
      CSV.foreach_hash fname_rating do |row, line|
        email = row["email"]
        value = row["value"]
        
        if seen[email]
          warning %Q{#{line + 1}: повторяется "#{email}"}
          next
        end
        seen[email] = true
        
        # for corporative staff
        if type == "corp"
          m = /\@(\S+)/.match email
          if m then
            value = m[1]
          else
            error %Q{#{line + 1}: не могу понять email: "#{value}"}
            next
          end
        elsif type == "comp"
          rating[email] = value.to_f
          next
        end
        
        name = substitute[value]
        if name then
          unless name == "!" then
            rating[name] = rating[name] ? rating[name] + 1 : 1
          end
        else
          warning %Q{#{line + 1}: неизвестное "#{value}"}
        end
        
      end
    end
    
    @entity["rating"]["data"] = rating
  end
  
  def update_images src_dir, dst_dir
    if File.exists?(src_dir.path + "/promo-bg.png")
      @entity["promo"] = 1
      FileUtils.cp_r(src_dir.path + "/promo-bg.png", dst_dir.path + "/promo-bg.png", @mv_opt)
    end
    
    if File.exists?(src_dir.path + "/preview.jpg")
      FileUtils.cp_r(src_dir.path + "/preview.jpg", dst_dir.path + "/preview.jpg", @mv_opt)
    end
    
    @entity["dialogue"].each do |v|
      FileUtils.mkdir_p dst_dir.path + "/dialogues/"
      FileUtils.cp_r(src_dir.path + "/dialogues/" + v["back"], dst_dir.path + "/dialogues/" + v["back"], @mv_opt)
      if v["popups"]
        FileUtils.cp_r(src_dir.path + "/dialogues/" + v["popups"], dst_dir.path + "/dialogues/" + v["popups"], @mv_opt)
      end
    end
  end
  
  def update_html entity, dst
    template = File.open(Config::TEMPLATES + "event.#{entity["lang"]}.rhtml").read
    renderer = ERB.new(template)
    
    File.write("#{dst.path}/index.html", renderer.result(EventTemplate.new(entity).get_binding))
  end
  
  def cleanup_deleted
    say "ищу удаленные"
    indent do
    index = {}
    @entities_array.each do |entity|
      index[entity["href"]] = entity
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
    @entities.each do |name, entity|
      # YAGNI
      entity.delete("subject")
      entity.delete("high_head")
      entity.delete("promo")
      entity.delete("imgdir")
      entity.delete("main")
      entity.delete("sent_message")
      entity.delete("sent_message_en")
    end
    
    flush_json_object(@entities, Config::DB_JS)
  end
  
  def flush_links
    File.open(Config::NOSCRIPT_LINKS, "w+") do |links|
      @entities.each do |name, entity|
        links.puts %Q{<li><a href="/event/#{entity["href"]}/">#{entity["name"]}</a></li>}
      end
    end
  end
end

exit EventsProcessor.new.run
#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

require "inshaker"

class GroupsProcessor < Inshaker::Processor
  
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Groups/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "gruppy-kokteyley/"
    
    TEMPLATES      = Inshaker::TEMPLATES_DIR
  end
  
  def initialize
    super
    @entities = []
    @entities_hrefs = {}
  end
  
  def job_name
    "смешивалку групп коктейлей"
  end
  
  def job
    sync_base "Groups"
    fix_base "Groups"
    
    prepare_dirs
    
    update_groups
    return
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
  
  def update_groups
    Dir.new(Config::BASE_DIR).each_dir do |entity_dir|
      say entity_dir.name
      indent do
        process_entity entity_dir
      end
    end
  end
  
  def process_entity src_dir
    return unless File.exists? src_dir.path + "/about.yaml"
    yaml = YAML::load(File.open(src_dir.path + "/about.yaml"))
    
    
    
    @entity = OpenStruct.new(
      name:   src_dir.name,
      path:   yaml['Путь'],
      prefix: yaml['Префикс'],
      tags:   yaml['Теги'],
      facts:  yaml['Факты']
    )
    
    seen = @entities_hrefs[@entity.path]
    if seen
      error %Q{группа с такой ссылкой уже существует: "#{seen.name}"}
    else
      @entities_hrefs[@entity.path] = @entity
    end
    
    
    ht_path = Config::HT_ROOT + @entity.path
    FileUtils.mkdir_p ht_path
    ht_dir = Dir.new(ht_path)
    return
    update_html @entity, ht_dir
    
    @entities << @entity
  end
  
  def update_main
    @type_names.each do |k, v|
      main_event = @type_main[k]
      if main_event
        say %Q{главное событие #{v}: "#{main_event["name"]}"}
        File.write(Config::MAIN_LINK % k, %Q{/event/#{main_event["href"]}/})
      else
        if @by_type[k] == 0
          warning "ни одно событие #{v} не назначено главным, но и событий этого типа нету вообще"
        else
          error "ни одно событие #{v} не назначено главным"
        end
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
        
        email_key = email.gsub(/\s/, "").downcase
        if seen[email_key]
          warning %Q{#{line + 1}: повторяется "#{email}"}
          next
        end
        seen[email_key] = line
        
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

exit GroupsProcessor.new.run
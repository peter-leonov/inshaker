#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

require "inshaker"
require "entities/cocktail"
require "entities/ingredient"

class GroupsProcessor < Inshaker::Processor
  
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Groups/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "gruppy-kokteyley/"
    
    TEMPLATE       = Inshaker::TEMPLATES_DIR + "cocktail-group.rhtml"
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
    
    Ingredient.init
    Cocktail.init
    
    @renderer = ERB.new(File.read(Config::TEMPLATE))
    
    update_groups
    
    unless errors?
      # cleanup_deleted
    end
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
    
    update_html ht_dir
    
    @entities << @entity
  end
  
  def update_html dst
    mid = @entity.facts.map(&:size).reduce(:+) / 2
    size = 0
    @column_a, @column_b = @entity.facts.partition {|s| size += s.size; size <= mid}
    
    @cocktails = Cocktail.by_any_of_entities(@entity.tags).sort_by { |c| [c["ingredients"].size, c["name"]] }
    
    File.write("#{dst.path}/#{@entity.path}.html", @renderer.result(binding))
  end
  
  def cleanup_deleted
    say "ищу удаленные"
    indent do
    index = {}
    @entities.each do |entity|
      index[entity["href"]] = entity
    end
    
    Dir.new(Config::HT_ROOT).each_dir do |dir|
      unless index[dir.name]
        say "удаляю #{dir.name}"
        # FileUtils.rmtree(dir.path)
      end
    end
    end # indent
  end
end

exit GroupsProcessor.new.run
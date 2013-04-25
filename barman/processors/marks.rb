#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

require "inshaker"
require "entities/mark"

class MarksProcessor < Inshaker::Processor
  
  module Config
    include Mark::Config
  end
  
  def initialize
    super
    @entities = []
  end
  
  def job_name
    "смешивалку марок"
  end
  
  def job
    sync_base "Marks"
    fix_base "Marks"
    
    process_entities
    
    unless errors?
      cleanup_deleted
      flush_links
      flush_json
    end
  end
  
  def process_entities
    say "обновляю марки"
    indent do
    Dir.new(Config::BASE_DIR).each_dir do |entity_dir|
      update_entity entity_dir
    end
    end # indent
  end
  
  def update_entity src_dir
    say src_dir.name
    indent do
    
    @entity = {}
    
    # about = load_yaml(src_dir.path + "/about.yaml")
    
    ht_name = src_dir.name.dirify
    ht_dir = Dir.create("#{Config::HT_ROOT}#{ht_name}")
    
    @entity["name"] = src_dir.name
    @entity["path"] = ht_name
    
    banner_path = "#{src_dir.path}/banner.png"
    if File.exists?(banner_path)
      FileUtils.cp_r(banner_path, "#{ht_dir.path}/banner.png", @mv_opt)
    else
      error "нету банера"
    end
    
    @entities << @entity
    end # indent
  end
  
  def cleanup_deleted
    say "ищу удаленные"
    indent do
    index = {}
    @entities.each do |entity|
      index[entity["path"]] = entity
    end
    
    Dir.new(Config::HT_ROOT).each_dir do |dir|
      unless index[dir.name]
        say "удаляю #{dir.name}"
        FileUtils.rmtree(dir.path)
      end
    end
    end # indent
  end
  
  def flush_links
    File.open(Config::NOSCRIPT_LINKS, "w+") do |links|
      @entities.each do |entity|
        links.puts %Q{<li><a href="/mark/#{entity["path"]}/">#{entity["name"]}</a></li>}
      end
    end
  end
  
  def flush_json
    @entities.each do |entity|
      # YAGNI
      # entity.delete("about")
    end
    
    flush_json_object(@entities, Config::DB_JS)
  end
  
  class Template
    def initialize *hashes
      hashes.each do |hash|
        hash.each do |k, v|
          instance_variable_set("@#{k}", v)
        end
      end
    end

    def get_binding
      binding
    end
  end
end 

exit MarksProcessor.new.run
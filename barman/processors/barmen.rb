#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

require "inshaker"
require "entities/barman"
require "entities/cocktail"

class BarmenProcessor < Inshaker::Processor

  module Config
    include Barman::Config
  end
  
  def initialize
    super
    @entities = []
  end
  
  def job_name
    "смешивалку барменов"
  end
  
  def job
    sync_base "Barmen"
    fix_base "Barmen"
    
    Barman.init
    prepare_cocktails
    prepare_renderer
    
    process_barmen
    
    unless errors?
      cleanup_deleted
      flush_links
      flush_json
      
      Barman.check_integrity
    end
  end
  
  def prepare_cocktails
    Cocktail.init
  end
  
  def prepare_renderer
    @renderer = ERB.new(File.read(Config::TEMPLATE))
  end
  
  def process_barmen
    say "обновляю барменов"
    indent do
    Dir.new(Config::BASE_DIR).each_dir do |barman_dir|
      update_barman barman_dir
    end
    end # indent
  end
  
  def update_barman src_dir
    say src_dir.name
    indent do
    
    about = load_yaml(src_dir.path + "/about.yaml")
    
    @barman = {}
    
    @barman["name"] = src_dir.name
    @barman["name_eng"] = about["Name"]
    @barman["about"] = about["О бармене"]
    
    ht_name = @barman["name_eng"].dirify
    dst_dir = Dir.create("#{Config::HT_ROOT}#{ht_name}")
    @barman["path"] = ht_name
    
    if names = about["Коктейли"]
      cocktails = []
      names.each do |name|
        cocktail = Cocktail[name]
        if cocktail
          cocktails << cocktail
        else
          error "нет такого коктейля «#{name}»"
          if name.has_diacritics
            say "пожалуйста, проверь буквы «й» и «ё» на «правильность»"
          end
        end
      end
      @barman["cocktails"] = cocktails
    end
  
    photo_path = "#{src_dir.path}/photo.jpg"
    if File.exists?(photo_path)
      FileUtils.cp_r(photo_path, "#{dst_dir.path}/photo.jpg", @mv_opt)
    else
      error "нету фотки бармена"
    end
    
    render_erb "#{dst_dir.path}/index.html", @barman
    
    data = {
      "description" => @barman["about"] 
    }
    flush_json_object(data, "#{dst_dir.path}/data.json")
    
    @entities << @barman
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
        links.puts %Q{<li><a href="/barman/#{entity["path"]}/">#{entity["name"]}</a></li>}
      end
    end
    
    File.open(Config::SITEMAP_LINKS, "w+") do |links|
      @entities.each do |entity|
        links.puts %Q{http://#{Inshaker::DOMAIN}/barman/#{entity["path"]}/}
      end
    end
  end
  
  def flush_json
    @entities.each do |entity|
      # YAGNI
      entity.delete("about")
      if entity["cocktails"]
        entity["cocktails"].map! { |e| e["name"] }
      end
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

exit BarmenProcessor.new.run
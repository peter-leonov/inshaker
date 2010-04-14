#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'

class BarmenProcessor < Barman::Processor

  module Config
    BASE_DIR       = Barman::BASE_DIR + "Barmen/"
    
    HT_ROOT        = Barman::HTDOCS_DIR + "barman/"
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    
    DB_JS          = Barman::HTDOCS_DIR + "db/barmen.js"
    COCKTAILS_DB   = Barman::HTDOCS_DIR + "db/cocktails.js"
    
    TEMPLATE       = Barman::TEMPLATES_DIR + "barman.rhtml"
  end
  
  def initialize
    super
    @cocktails = {}
    @entities = []
  end
  
  def job_name
    "смешивалку барменов"
  end
  
  def job
    prepare_cocktails
    
    process_barmen
    
    unless errors?
      # cleanup_deleted
      # flush_links
      flush_json
    end
  end
  
  def prepare_cocktails
    if File.exists?(Config::COCKTAILS_DB)
      @cocktails = load_json(Config::COCKTAILS_DB)
    end
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
    
    ht_name = @barman["name_eng"].html_name
    dst_dir = Dir.create("#{Config::HT_ROOT}#{ht_name}")
    @barman["path"] = ht_name
    
    if cocktails = about["Коктейли"]
      cocktails.each do |name|
        unless @cocktails[name]
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
    
    @entities << @barman
    end # indent
  end
  
  def flush_json
    @entities.each do |entity|
      # YAGNI
      entity.delete("about")
    end
    
    flush_json_object(@entities, Config::DB_JS)
  end
end 

exit BarmenProcessor.new.run
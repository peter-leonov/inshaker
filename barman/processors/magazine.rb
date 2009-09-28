#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'

class MagazineProcessor < Barman::Processor
  
  module Config
    BASE_DIR = Barman::BASE_DIR + "Magazine/"
    HTDOCS_DIR = Barman::HTDOCS_DIR
    
    DB_JS = HTDOCS_DIR + "db/magazine.js"
  end
  
  def initialize
    super
    @db = {}
  end
  
  def job_name
    "смешивалку главной страницы"
  end
  
  def job
    process_about
    
    if summary
      flush_json
    end
  end
  
  def process_about
    about = YAML::load(File.open(Config::BASE_DIR + "about.yaml"))
    
    say "обновляю коктейли"
    indent do
    update_cocktails(@db["cocktails"]   = about['Коктейли'])
    end # indent
    
    say "обновляю промо"
    indent do
    update_entities(@db["promos"] = about['Промо'], "promos", "jpg")
    end # indent
    
    say "обновляю линки"
    indent do
    update_entities(@db["links"] = about['Inshaker рекомендует'], "links", "png")
    end # indent
  end
  
  def update_cocktails entities
    entities.each do |entity|
      say entity
    end
  end
  
  def update_entities entities, name, ext
    basedir = Config::BASE_DIR + name
    htdir = Config::HTDOCS_DIR + "i/index/" + name
    FileUtils.mkdir_p htdir
    
    i = 1
    entities.each do |entity|
      name, href = entity[0], entity[1]
      say name
      indent do
      copy_image basedir, htdir, "#{i}.#{ext}", 150
      end # indent
      i += 1
    end
  end
  
  def copy_image src, dst, name, max_size
    from = "#{src}/#{name}"
    if File.exists? from
      if File.size(from) > max_size * 1024
        warning "картинка слишком большая (>#{max_size}Кб) #{name}"
      end
      
      begin
        FileUtils.cp_r from, dst, @mv_opt
      rescue
        error "не удалось скопировать картинку #{name}"
      end
    else
      error "нет картинки"
    end
  end
  
  def flush_json
    flush_json_object(@db, Config::DB_JS)
  end
end

exit MagazineProcessor.new.run
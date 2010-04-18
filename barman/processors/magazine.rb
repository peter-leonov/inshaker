#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require "barman"

class MagazineProcessor < Barman::Processor
  
  module Config
    BASE_DIR = Barman::BASE_DIR + "Magazine/"
    PROMOS_DIR = BASE_DIR + "promos/"
    HTDOCS_DIR = Barman::HTDOCS_DIR
    
    DB_JS = HTDOCS_DIR + "db/magazine.js"
    # PROMOS_LIST = HTDOCS_DIR + "promos-list.html"
    PROMOS_IMAGES = "i/index/promos/"
  end
  
  def initialize
    super
    @db = {}
    @promos = []
  end
  
  def job_name
    "смешивалку главной страницы"
  end
  
  def job
    process_about
    process_promos
    
    unless errors?
      flush_json
    end
  end
  
  def process_promos
    say "обрабатываю промо"
    indent do
    promos = []
    Dir.new(Config::PROMOS_DIR).each_dir do |promo_dir|
      name = promo_dir.name
      say name
      indent do
      about = load_yaml("#{promo_dir.path}/about.yaml")
      html_name = name.translify.html_name
      path = "#{Config::PROMOS_IMAGES}/#{html_name}.jpg"
      copy_image("#{promo_dir.path}/image.jpg", "#{Config::HTDOCS_DIR}/#{path}", "промо", 150)
      promos << {"name" => name, "html_name" => html_name, "href" => about["Ссылка"]}
      end # indent
    end
    order = load_yaml("#{Config::PROMOS_DIR}/_order.yaml")
    @db["promos"] = promos.sort do |a, b|
      (order.index(a["name"]) || Infinity) - (order.index(b["name"]) || Infinity)
    end
    end # indent
  end
  
  def process_about
    about = YAML::load(File.open(Config::BASE_DIR + "about.yaml"))
    
    say "обновляю коктейли"
    indent do
    update_cocktails(@db["cocktails"] = about['Коктейли'])
    end # indent
    
    say "обновляю линки"
    indent do
    update_entities @db["links"] = about['Inshaker рекомендует'], "links", "png", "линка"
    end # indent
  end
  
  def update_cocktails entities
    entities.each do |entity|
      say entity
    end
  end
  
  def update_entities entities, name, ext, kind,
    basedir = Config::BASE_DIR + name
    htdir = Config::HTDOCS_DIR + "i/index/" + name
    FileUtils.mkdir_p htdir
    
    i = 1
    entities.each do |entity|
      name, href = entity[0], entity[1]
      say name
      indent do
      fname = "#{i}.#{ext}"
      copy_image "#{basedir}/#{fname}", "#{htdir}/#{fname}", kind, 150
      end # indent
      i += 1
    end
  end
  
  def flush_json
    flush_json_object(@db, Config::DB_JS)
  end
end

exit MagazineProcessor.new.run
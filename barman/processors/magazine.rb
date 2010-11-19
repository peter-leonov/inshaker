#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require "inshaker"
require "entities/cocktail"

Cocktail.init

class MagazineProcessor < Inshaker::Processor
  
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Magazine/"
    BASE_DIR_PROMO = BASE_DIR + "promos/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "magazine/"
    HT_ROOT_PROMOS = HT_ROOT + "promos/"
    
    DB_JS          = Inshaker::HTDOCS_DIR + "db/magazine.js"
    
    BLOCK_NAMES = {
      "Коктейльная классика" => "classic",
      "Самые популярные" => "pop",
      "Авторские хиты" => "author",
      "Коктейли месяца" => "special"
    }
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
    prepare_dirs
    
    process_about
    process_promos
    
    unless errors?
      flush_json
    end
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::HT_ROOT, Config::HT_ROOT + "promos", Config::HT_ROOT + "links"]
  end
  
  def process_promos
    say "обрабатываю промо"
    indent do
    promos = []
    Dir.new(Config::BASE_DIR_PROMO).each_dir do |promo_dir|
      name = promo_dir.name
      say name
      indent do
      about = load_yaml("#{promo_dir.path}/about.yaml")
      html_name = name.dirify
      copy_image("#{promo_dir.path}/image.jpg", "#{Config::HT_ROOT}/promos/#{html_name}.jpg", "промо", 250, 350)
      promos << {"name" => name, "html_name" => html_name, "href" => about["Ссылка"]}
      end # indent
    end
    order = load_yaml("#{Config::BASE_DIR_PROMO}/_order.yaml")
    @db["promos"] = promos.sort do |a, b|
      (order.index(a["name"]) || Infinity) - (order.index(b["name"]) || Infinity)
    end
    end # indent
  end
  
  def process_about
    about = YAML::load(File.open(Config::BASE_DIR + "about.yaml"))
    
    say "обновляю коктейли"
    indent do
    @db["cocktails"] = {}
    Config::BLOCK_NAMES.each do |name, prop|
      say name
      indent do
      set = []
      about[name].each do |cocktail|
        say cocktail
        unless Cocktail[cocktail]
          error "нет такого коктейля «#{cocktail}»"
          next
        end
        set << cocktail
      end
      @db["cocktails"][prop] = set
      end # indent
    end
    end # indent
  end
  
  def flush_json
    flush_json_object(@db, Config::DB_JS)
  end
end

exit MagazineProcessor.new.run
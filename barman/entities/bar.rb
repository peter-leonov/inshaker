# encoding: utf-8
require "entities/cocktail"
class Bar < Inshaker::Entity
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Bars/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "bar/"
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    SITEMAP_LINKS  = HT_ROOT + "sitemap.txt"
    
    DB_JS          = Inshaker::HTDOCS_DIR + "db/bars/bars.json"
    DB_JS_CITIES   = Inshaker::HTDOCS_DIR + "db/bars/cities.json"
    BARMEN_JS      = Inshaker::HTDOCS_DIR + "db/barmen/barmen.json"
    
    TEMPLATE       = Inshaker::TEMPLATES_DIR + "bar.rhtml"
    DECLENSIONS    = BASE_DIR + "declensions.yaml"
    
    IMAGE_GEOMETRY = {:small => [590, 242], :big => [590, 320]}
  end
  
  def self.init
    return if @inited
    @inited = true
    
    Cocktail.init
    
    if File.exists?(Config::DB_JS)
      @db = JSON.parse(File.read(Config::DB_JS))
    else
      @db = []
    end
  end
  
  def self.check_integrity
    say "проверяю связность данных баров"
    indent do
    @db.each do |bar|
      indent bar["name"] do
      
      unless Barman[bar["chief"]]
        error "нет бармена с таким именем «#{bar["chief"]}»"
      end
      
      errors = []
      bar["carte"].each do |cocktail_name|
        unless Cocktail[cocktail_name]
          errors << cocktail_name
        end
      end
      
      unless errors.empty?
        error "#{errors.length.plural("нет такого коктейля", "нет таких коктейлей", "нет таких коктейлей")}: #{errors.join(", ")}"
      end
      end # indent
    end
    end #indent
  end
end
# encoding: utf-8
require "entities/cocktail"
class Bar < Inshaker::Entity
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Bars/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "bar/"
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    SITEMAP_LINKS  = HT_ROOT + "sitemap.txt"
    
    DB_JS          = Inshaker::HTDOCS_DIR + "db/bars.js"
    DB_JS_CITIES   = Inshaker::HTDOCS_DIR + "db/cities.js"
    COCKTAILS_DB   = Inshaker::HTDOCS_DIR + "db/cocktails.js"
    BARMEN_JS      = Inshaker::HTDOCS_DIR + "db/barmen.js"
    
    TEMPLATE       = Inshaker::TEMPLATES_DIR + "bar.rhtml"
    DECLENSIONS    = Inshaker::BASE_DIR + "declensions.yaml"
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
      next unless bar["chief"]
      
      unless Barman[bar["chief"]]
        say bar["name"]
        indent do
        error "нет бармена с таким именем «#{bar["chief"]}»"
        end # indent
      end
    end
    end #indent
  end
end
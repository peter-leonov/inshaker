# encoding: utf-8
require "entities/cocktail"
class Barman < Inshaker::Entity
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Barmen/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "barman/"
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    SITEMAP_LINKS  = HT_ROOT + "sitemap.txt"
    
    DB_JS          = Inshaker::HTDOCS_DIR + "db/barmen.js"
    
    TEMPLATE       = Inshaker::TEMPLATES_DIR + "barman.rhtml"
  end
  
  def self.init
    return if @inited
    @inited = true
    
    Cocktail.init
    
    @db = []
    @by_name = {}
    
    if File.exists?(Config::DB_JS)
      @db = JSON.parse(File.read(Config::DB_JS))
      @by_name = @db.hash_index("name")
    end
  end
  
  def self.[] name
    @by_name[name]
  end
  
  def self.check_integrity
    say "проверяю связность данных барменов"
    indent do
    @db.each do |barman|
      indent barman["name"] do
      
      next unless barman["cocktails"]
      
      errors = []
      barman["cocktails"].each do |cocktail_name|
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
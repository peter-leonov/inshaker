# encoding: utf-8
require "entities/ingredient"
class Cocktail < Inshaker::Entity
  module Config
    COCKTAILS_DIR = Inshaker::BASE_DIR + "Cocktails/"
    HTDOCS_DIR    = Inshaker::HTDOCS_DIR
    
    HTDOCS_ROOT        = HTDOCS_DIR + "cocktail/"
    DB_JS              = HTDOCS_DIR + "db/cocktails.js"
    DB_JS_TAGS         = HTDOCS_DIR + "db/tags.js"
    DB_JS_GROUPS       = HTDOCS_DIR + "db/groups.js"
    DB_JS_STRENGTHS    = HTDOCS_DIR + "db/strengths.js"
    DB_JS_METHODS      = HTDOCS_DIR + "db/methods.js"
    DB_JS_INGREDS      = HTDOCS_DIR + "db/ingredients.js"
    DB_JS_INGRED_GROUPS= HTDOCS_DIR + "db/ingredients_groups.js"
    
    
    NOSCRIPT_LINKS     = HTDOCS_ROOT + "links.html"
    SITEMAP_LINKS      = HTDOCS_ROOT + "sitemap.txt"
    
    VIDEOS_DIR = HTDOCS_DIR + "v/"
    
    COCKTAIL_ERB  = Inshaker::TEMPLATES_DIR + "cocktail.rhtml"
    RECOMENDATIONS_ERB  = Inshaker::TEMPLATES_DIR + "recomendations.rhtml"
    RECOMENDATIONS_COUNT = 14
  end
  
  def self.init
    return if @inited
    @inited = true
    
    Ingredient.init
    
    @db = []
    @by_name = {}
    
    if File.exists?(Config::DB_JS)
      JSON.parse(File.read(Config::DB_JS)).each do |name, cocktail|
        @db << cocktail
        @by_name = @db.hash_index("name")
      end
    end
  end
  
  def self.[] name
    @by_name[name]
  end
  
  def self.check_integrity
    say "проверяю связность данных коктейлей"
    indent do
    @db.each do |cocktail|
      indent cocktail["name"] do
      cocktail["ingredients"].each do |part|
        errors = []
        unless Ingredient[part[0]]
          errors << part[0]
        end
        unless errors.empty?
          error "#{errors.length.plural("нет такого ингредиента", "нет таких ингредиентов", "нет таких ингредиентов")}: #{errors.join(", ")}"
        end
      end
      end # indent
    end
    end #indent
  end
end
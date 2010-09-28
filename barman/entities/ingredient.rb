# encoding: utf-8
class Ingredient < Inshaker::Entity
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Ingredients/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "ingredient/"
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    
    DB_JS          = Inshaker::HTDOCS_DIR + "db/ingredients.js"
    DB_JS_GROUPS   = Inshaker::HTDOCS_DIR + "db/ingredients_groups.js"
    DB_JS_MARKS    = Inshaker::HTDOCS_DIR + "db/marks.js"
  end
  
  def self.init
    return if @inited
    @inited = true
    
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
    say "проверяю связность данных ингредиентов"
  end
end
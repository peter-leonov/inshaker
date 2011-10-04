# encoding: utf-8
class Ingredient < Inshaker::Entity
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Ingredients/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "ingredient/"
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    
    DB_JS          = Inshaker::HTDOCS_DIR + "db/ingredients/ingredients.json"
    DB_JS_GROUPS   = Inshaker::HTDOCS_DIR + "db/ingredients/groups.json"
    DB_JS_TAGS     = Inshaker::HTDOCS_DIR + "db/ingredients/tags.json"
  end
  
  def self.init
    return if @inited
    @inited = true
    
    @db = JSON.parse(File.read(Config::DB_JS))
    @by_name = @db.hash_index("name")
  end
  
  def self.check_integrity
    say "проверяю связность данных ингредиентов"
  end
  
  @normals = {
    'мл' => {1000 => 'л'},
    'г' => {1000 => 'кг', 1000000 => 'т'},
    'гр' => {1000 => 'кг', 1000000 => 'т'}
  }
  def self.humanize_dose vol, unit
    vol = vol.to_f
    normal = @normals[unit]
    return [vol.may_be_to_i, unit] unless normal
    
    normal.keys.sort.reverse.each do |v|
      next if vol < v
      
      vol /= v
      
      return [vol.may_be_to_i, normal[v]]
    end
    
    [vol.may_be_to_i, unit]
  end
end

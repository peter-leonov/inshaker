# encoding: utf-8
class Ingredient < Inshaker::Entity
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Ingredients/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "ingredient/"
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    
    DB_JS          = Inshaker::HTDOCS_DIR + "db/ingredients/ingredients.json"
    DB_JS_GROUPS   = Inshaker::HTDOCS_DIR + "db/ingredients/groups.json"
    DB_JS_TAGS     = Inshaker::HTDOCS_DIR + "db/ingredients/tags.json"
    DB_JS_UNITS    = Inshaker::HTDOCS_DIR + "db/ingredients/units.json"
  end
  
  def self.init
    return if @inited
    @inited = true
    
    @db = JSON.parse(File.read(Config::DB_JS))
    @by_name = @db.hash_index("name")
    @units_i = JSON.parse(File.read(Config::DB_JS_UNITS)).hash_index
  end
  
  def self.check_integrity
    say "проверяю связность данных ингредиентов"
  end
  
  @normals =
  {
    'мл' => [0.001, 'л'],
    'кг' => [1000, 'г']
  }
  
  def self.normalize_dose vol, unit
    n = @normals[unit]
    unless n
      return [vol, unit]
    end
    
    [(vol * n[0]).round(6), n[1]]
  end
  
  
  litre = [
    [0...1, 1000, "мл"],
    [1...1000, 1, "л"]
  ]
  
  gramme = [
    [0...1000, 1, "г"],
    [1000...1000000, 0.001, "кг"],
    [1000000...1000000000, 0.000001, "т"]
  ]
  
  @humans = {
    "л" => litre,
    "г" => gramme
  }
  
  @multipliers = {
    "на коктейль" => "cocktail",
    "на человека" => "guest",
    "на порцию" => "helping",
    "на вечеринку" => "party"
  }
  
  @multiplier_id = {
    "cocktail" => 0,
    "guest" => 1,
    "helping" => 2,
    "party" => 3
  }
  
  def self.get_multiplier_id multiplier
    @multiplier_id[multiplier]
  end
  
  def self.humanize_dose vol, unit
    
    human = @humans[unit]
    unless human
      return [vol, unit]
    end
    
    human.each do |scale|
      if scale[0].include? vol
        vol = (vol * scale[1]).round(6)
        return [vol, scale[2]]
      end
    end
    
    [vol, unit]
  end
  
  def self.parse_dose dose
    m = dose.match(/^ *(\d+(?:[.,]\d+)?) *(\S+)(?: +(на человека|на порцию|на вечеринку))? *$/)
    unless m
      return nil
    end
    
    unit = m[2]
    unless @units_i[unit]
      return [false, unit]
    end
    
    multiplier = m[3]
    if multiplier
      type = @multipliers[multiplier]
      if type
        multiplier = type
      else
        error "непонятный множитель «#{multiplier}»"
      end
    else
      multiplier = @multipliers["на коктейль"]
    end
    
    vol = m[1].gsub(",", ".").to_f
    
    vol, unit = normalize_dose(vol, unit)
    
    return [vol, unit, multiplier]
  end
end

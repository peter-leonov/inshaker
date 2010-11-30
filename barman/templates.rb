# ERB mapping

class CocktailTemplate
  def initialize(hash)
    @name        = hash["name"]
    @name_eng    = hash["name_eng"]
    @name_html   = hash["name_eng"].html_name 

    @teaser      = hash["teaser"]
    @strength    = hash["strength"]
    @method      = hash["method"]
    @desc_start  = hash["desc_start"]
    @desc_end    = hash["desc_end"]
    @groups      = hash["groups"]
    @tools       = hash["tools"]
    @receipt     = hash["receipt"]
    @ingredients = hash["ingredients"]
    @garnish     = hash["garnish"]
    @sorted_parts= hash["sorted_parts"]
    @video       = hash["video"]
    
    @recs        = hash["recs"]
  end
  
  def parts
    @sorted_parts.each do |name, dose|
      m = dose.match(/(\d+(?:\.\d+)?)\s*(.+)\s*/)
      amount = m[1]
      unit = m[2]
      normilized = Ingredient.normalize_volume(amount, unit)
      amount = normilized[0]
      unit = normilized[1]
      
      yield name, amount, unit
    end
  end
  
  def groups
    groups = []
    groups << ["/cocktails.html#strength=#{@strength}", @strength]
    
    @groups.each do |group|
      groups << ["/cocktails.html#tag=#{group}", group]
    end
    groups
  end
  
  def get_binding
    binding
  end
end

class CocktailRecomendationsTemplate
  def initialize(recs)
    @recs = recs
  end
  
  def get_binding
    binding
  end
end

class BarTemplate
  def initialize *hashes
    hashes.each do |hash|
      hash.each do |k, v|
        instance_variable_set("@#{k}", v)
      end
    end
  end
  
  def get_binding
    binding
  end
end

class EventTemplate
  def initialize *hashes
    hashes.each do |hash|
      hash.each do |k, v|
        instance_variable_set("@#{k}", v)
      end
    end
  end
  
  def get_binding
    binding
  end
end

class Cocktail
  def initialize(hash)
    @name        = hash[:name]
    @name_eng    = hash[:name_eng]
    @name_html   = hash[:name_eng].html_name 

    @teaser      = hash[:teaser]
    @strength    = hash[:strength]
    @desc_start  = hash[:desc_start]
    @desc_end    = hash[:desc_end]
    @tags        = hash[:tags]
    @tools       = hash[:tools]
    @receipt     = hash[:receipt]
    @ingredients = hash[:ingredients]
    @has_video   = hash[:has_video]
  end
  
  def get_binding
    binding
  end
end
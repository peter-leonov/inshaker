# ERB mapping

class CocktailTemplate
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

class BarTemplate
  def initialize(hash)
    @name       = hash[:name]
    @city       = hash[:city]
    @id         = hash[:id]
    @big_images = hash[:big_images]
    @desc_start = hash[:desc_start].gsub(/[\n\r]/, "<br/>")
    @desc_end   = hash[:desc_end].gsub(/[\n\r]/, "<br/>")
    @format     = hash[:format]
    @feel       = hash[:feel]
    @chief      = hash[:chief]
    @cuisine    = hash[:cuisine]
    @entrance   = hash[:entrance]
  end
  
  def get_binding
    binding
  end
end

class EventTemplate
  def initialize(hash)
    @name       = hash[:name]
    @city       = hash[:city]
    @header     = hash[:header]
    @target     = hash[:target]
    @subject    = hash[:subject]
    @country    = hash[:country]
    @href       = hash[:href]
    @address    = hash[:address]
    @bar        = hash[:bar]
    @fields     = hash[:fields]
    @imgdir     = hash[:imgdir]
    @promo      = hash[:promo]
  end
  
  def get_binding
    binding
  end
end

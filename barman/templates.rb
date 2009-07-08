# ERB mapping

class CocktailTemplate
  def initialize(hash)
    @name        = hash["name"]
    @name_eng    = hash["name_eng"]
    @name_html   = hash["name_eng"].html_name 

    @teaser      = hash["teaser"]
    @strength    = hash["strength"]
    @desc_start  = hash["desc_start"]
    @desc_end    = hash["desc_end"]
    @tags        = hash["tags"]
    @tools       = hash["tools"]
    @receipt     = hash["receipt"]
    @ingredients = hash["ingredients"]
    @video       = hash["video"]
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
  def initialize(hash)
    @name       = hash[:name]
    @city       = hash[:city]
    @venue      = hash[:venue]
    @header     = hash[:header]
    @target     = hash[:target]
    @subject    = hash[:subject]
    @country    = hash[:country]
    @href       = hash[:href]
    @date       = hash[:date]
    @adate      = hash[:adate]
    @date_ru    = hash[:date_ru]
    @address    = hash[:address]
    @fields     = hash[:fields]
    @imgdir     = hash[:imgdir]
    @promo      = hash[:promo]
    @photos     = hash[:photos]
    @enter      = hash[:enter]
    @status      = hash[:status]
    @form_hint  = hash[:form_hint]
  end
  
  def get_binding
    binding
  end
end

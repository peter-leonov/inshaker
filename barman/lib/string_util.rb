require 'rutils'

class String
  
  def trans
    res = self.gsub('й','й')
    return res.bidi_translify.gsub("+", "")
  end
  
  def zpt
    return self.gsub(",",".")
  end
  
  def trim
    return self.gsub(/\s+$/,"")
  end
  
  def html_name
    return self.downcase.gsub(/[^\w\-\.]/,"_")
  end
  
  def cut_last_dot
    self.gsub(/\.\s*$/, "")
  end
  
  def html_paragraphs
    self.split("\n").map {|p| p = "<p>#{p}</p>"}.join("")
  end
  
  def downcase
     Unicode::downcase(self)
  end
  
  def downcase!
    self.replace downcase
  end
  
  def upcase
    Unicode::upcase(self)
  end
  
  def upcase!
    self.replace upcase
  end
  
  def capitalize
    Unicode::capitalize(self)
  end
  
  def capitalize!
    self.replace capitalize
  end
end
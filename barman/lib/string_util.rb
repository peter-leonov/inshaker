require 'rutils'

class String
  
  def trans
    gsub('й','й').dirify
  end

  def yi
    self.gsub('й','й')
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
  
  def html_paragraphs final_snippet = ""
    res = []
    paragpaphs = self.split("\n")
    paragpaphs.each_with_index {|p,i| 
      res << "<p>#{p}#{i == paragpaphs.length - 1 ? final_snippet : "" }</p>" 
    }
    return res.join("")
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
  
  def ansi_quote
    gsub(/(['\\])/, '\\\\\1')
  end
end

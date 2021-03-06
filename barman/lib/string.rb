# encoding: utf-8
require "lib/rutils-simple"
require "lib/plural"
require "unicode_utils/upcase"
require "unicode_utils/downcase"

class String
  
  def trans
    dirify
  end
  
  def has_diacritics
    index /[̆̈]/
  end
  
  def zpt
    return self.gsub(",",".")
  end
  
  def iy
    gsub('й','й').gsub('Й','Й').gsub('ё','ё').gsub('Ё','Ё')
  end
  
  def trim
    return self.gsub(/\s+$/,"")
  end
  
  def u_downcase
    UnicodeUtils.downcase(self)
  end
  
  def u_upcase
    UnicodeUtils.upcase(self)
  end
  
  def cs_index
    return self.gsub(/\s+/," ").gsub(/^ | $/,"")
  end
  
  def ci_index
    return cs_index.u_downcase
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
  
  def ansi_quote
    gsub(/(['\\])/, '\\\\\1')
  end
  
  def quote
    gsub(/([$"\\])/, '\\\\\1')
  end
  
  def unescape_yaml
    eval(inspect.gsub(/\\\\x(\w\w)\\\\x(\w\w)/) { "\\x#{$1}\\x#{$2}" })
  end
end

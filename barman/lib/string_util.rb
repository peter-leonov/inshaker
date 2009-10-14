# encoding: utf-8
require 'rutils'

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
  
  def ansi_quote
    gsub(/(['\\])/, '\\\\\1')
  end
  
  def quote
    gsub(/([$"\\])/, '\\\\\1')
  end
end

require 'rutils'

class String
  def trans
    return self.bidi_translify.gsub("+", "")
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
  
  def unescape
    escape_chars  = %w(0410 0430 0411 0431 0412 0432 0413 0433 0490 0491 0414 0434 0415 0435 0401 0451 0404 0454 0416 0436 0417 0437 0418 0438 0406 0456 0419 0439 041a 043a 041b 043b 041c 043c 041d 043d 041e 043e 041f 043f 0420 0440 0421 0441 0422 0442 0423 0443 0424 0444 0425 0445 0426 0446 0427 0447 0428 0448 0429 0449 042a 044A 042b 044b 042c 044c 042d 044d 042e 044e 042f 044f 201c 201d)
    russian_chars = %w(А а Б б В в Г г Ґ ґ Д д Е е Ё ё Є є Ж ж З з И и І і Й й К к Л л М м Н н О о П п Р р С с Т т У у Ф ф Х х Ц ц Ч ч Ш ш Щ щ Ъ ъ Ы ы Ь ь Э э Ю ю Я я \" \")
    result = self
    escape_chars.each_with_index do |ec, i|
      result = result.gsub("\\u" + ec, russian_chars[i])
    end
    return result
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
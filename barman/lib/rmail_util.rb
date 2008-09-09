require 'rmail'
require 'base64'

class RMail::Message
  
  def self.words_base64 str
    str.to_s.gsub(/([^\x00-\x1f\x21-\x7f]+)/) { |v| "=?UTF-8?B?" + Base64.encode64(v).gsub(/\s+/, '') + "?=" }
  end
  
  def self.bake o
    m = RMail::Message.new
    
    m.header['To'] = words_base64 o[:to]
    m.header['From'] = words_base64 o[:from]
    
    m.header['Subject'] = words_base64 o[:subject]
    m.header['X-HTTP-User-Agent'] = ENV['HTTP_USER_AGENT'].to_s
    m.header['X-HTTP-Remote-Addr'] = (ENV['HTTP_X_FORWARDED_FOR'] || ENV['HTTP_X_REAL_IP'] || ENV['REMOTE_ADDR']).to_s
    
    m.body = []
    
    if o[:body]
      html = RMail::Message.new
      html.header['Content-Disposition'] = 'inline'
      html.header['Content-type'] = 'text/html; charset=utf-8'
      html.header['Content-Transfer-Encoding'] = 'base64' # binary
      
      html.body = Base64.encode64 o[:body]
      
      m.body += [html]
    end
    
    if o[:atts]
      m.body += o[:atts]
    end
    
    return m
  end
  
  def send
    IO.popen '/usr/sbin/sendmail -t -i -f pl@contactmaker.ru > /dev/null', 'w' do |f|
      f.print to_s
    end
  end
end

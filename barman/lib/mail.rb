# encoding: utf-8
require 'mail'

module Mail
  def self.bake o
    mail = Mail.new do
      from     o[:from]
      to       o[:to]
      subject  o[:subject]
      
      header['X-HTTP-User-Agent'] = ENV['HTTP_USER_AGENT'].to_s.dup
      header['X-HTTP-Remote-Addr'] = (ENV['HTTP_X_FORWARDED_FOR'] || ENV['HTTP_X_REAL_IP'] || ENV['REMOTE_ADDR']).to_s.dup
      
      
      html_part do
        content_type 'text/html; charset=utf-8'
        body o[:body]
      end
    end
    
    mail.delivery_method :sendmail
    
    mail
  end
end

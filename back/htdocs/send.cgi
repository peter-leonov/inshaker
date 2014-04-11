#!/usr/bin/env ruby1.9
# encoding: utf-8

require 'cgi'
require 'rest-client'
require 'oj'

class ClientError < Exception; end


class MailSender
  
  module Config
    FROM = 'mail@inshaker.ru'
    COPY_TO = %w{mail@inshaker.ru pl@inshaker.ru}
    LIMIT = 7
  end
  
  def run
    raise ClientError, 'Only POST method allowed' unless ENV['REQUEST_METHOD'] == 'POST'
    
    cgi = CGI.new
    
    @to = cgi.has_key?("to") ? cgi["to"].to_s : ''
    
    cgi.has_key?("subject") or raise ClientError, "'subject' is undefined"
    @subject = cgi["subject"].to_s
    
    cgi.has_key?("body") or raise ClientError, "'body' is undefined"
    @body = cgi["body"].to_s
    
    
    @to = @to.strip.split(/\s*,\s*/)
    @to.uniq!
    
    raise ClientError, "Too many addresses in 'to' with a limit of #{Config::LIMIT}." if @to.length > Config::LIMIT
    
    @to += Config::COPY_TO
    
    # send emails
    @to.collect do |to|
      RestClient.post "https://api:key-33cugysmbei5j08yh7tz2z4mx64lyua7"\
        "@api.mailgun.net/v2/mg.inshaker.ru/messages",
        :from => "Shaker <#{Config::FROM}>",
        :to => to,
        :subject => @subject,
        :html => @body
    end
  end
end


begin
  res = MailSender.new.run
  puts "Content-type: text/plain; charset=utf-8"
  puts ""

  puts Oj.dump(res)
  
rescue ClientError => e
  puts "Status: 400"
  puts "Content-type: text/plain; charset=utf-8"
  puts ""
  
  print e.message
  raise e
  
rescue => e
  puts "Status: 500"
  puts "Content-type: text/plain; charset=utf-8"
  puts ""
  
  print e.message
  raise e
  
end

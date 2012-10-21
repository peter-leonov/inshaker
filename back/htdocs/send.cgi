#!/usr/bin/env ruby1.9
# encoding: utf-8

$:.push('/www/inshaker/barman')

require "rubygems"
require "cgi"
require "lib/mail"

class ClientError < Exception
end


class MailSender
  
  module Config
    FROM = 'mail@inshaker.ru'
    LIMIT = 7
  end
  
  def run
    raise ClientError, 'Only POST method allowed' unless ENV['REQUEST_METHOD'] == 'POST'
    
    cgi = CGI.new
    
    @to = cgi.has_key?("to") ? cgi["to"].to_s : Config::FROM
    
    cgi.has_key?("subject") or raise ClientError, "'subject' is undefined"
    @subject = cgi["subject"].to_s
    
    cgi.has_key?("body") or raise ClientError, "'body' is undefined"
    @body = cgi["body"].to_s
    
    
    @to = @to.strip.split(/\s*,\s*/)
    @to.uniq!
    
    raise ClientError, "Too many addresses in 'to' with a limit of #{Config::LIMIT}." if @to.length > Config::LIMIT
    
    
    # send emails
    @to.each do |to|
      message = Mail.bake(:to => to, :from => "Shaker <#{Config::FROM}>", :subject => @subject, :body => @body)
      message.deliver
    end
  end
end


begin
  MailSender.new.run
  puts "Content-type: text/plain; charset=utf-8"
  puts ""

  puts "OK"
  
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

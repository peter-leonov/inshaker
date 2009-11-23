#!/usr/bin/ruby
require 'rubygems'
require 'lib/csv'
require 'lib/rmail'
require 'lib/smtp_tls'
require 'erb'

class Person
  def initialize hash
    hash.each do |k, v|
      instance_variable_set("@#{k}", v)
    end
  end
  def get_binding
    binding
  end
end

class Postman
  
  module Config
    USERNAME = 'event@inshaker.ru'
    PASSWORD = 'event_inshaker'
  end
  
  def render= tpl
    render = ERB.new(tpl.to_s.gsub("\r", ''))
  end
  
  def send_to path
    seen = {}
    CSV.foreach_hash(path) do |hash, line|
      hash["email"].gsub!(/\s+/, "")
      email = hash["email"].downcase
      if seen[email]
        warn "#{line}: DUPLICATE #{hash["email"]} of line #{seen[email]}"
        next
      end
      seen[email] = line
      
      raw = render.result(Person.new(hash).get_binding)
      message = {}
      head, body = raw.split(/\n\n/, 2)
      head.split(/\n/).each do |v|
        var, val = v.split(/: /, 2)
        message[var.downcase.to_sym] = val
      end
      message[:body] = body
      
      warn "#{line}: " + message[:to]
      mess = RMail::Message.bake(message).to_s
      
      Net::SMTP.start('smtp.gmail.com', 587, 'inshaker.ru', username, password, :plain) do |smtp|
        smtp.send_message(mess, 'event@inshaker.ru', message[:to])
      end
      
      sleep 3
    end
  end
end

p = Postman.new
p.render = File.read(ARGV[0])
p.send_to ARGV[1]
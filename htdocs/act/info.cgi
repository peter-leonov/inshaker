#!/usr/bin/env ruby

$main = "mail@inshaker.ru"

require "rubygems"
require "cgi"
require "rutils"
require "/www/inshaker/barman/lib/rmail"

p = CGI.new.params

body = %Q{
Имя: #{p["name"]}<br/>
Контакт: #{p["address"]}<br/>
Компания: #{p["company"]}<br/>
Что говорит: #{p["text"]}
}

m = RMail::Message.bake(:to => $main, :from => "info@inshaker.ru", :subject => "Предложение или вопрос по иншейкеру", :body => body)
m.send

puts "Content-type: application/javascript\n\n[]"

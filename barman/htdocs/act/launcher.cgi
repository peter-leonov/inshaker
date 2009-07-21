#!/usr/bin/ruby

require 'rubygems'
require 'cgi'
$stdout.sync = true

cgi = CGI.new('html4')

processors = ""
cgi.params.each{|k,v| processors += "#{k} " if k =~ /^[a-z]+$/}


puts "Content-type: text/plain; charset=utf-8\n\n"
system("cd /www/inshaker/barman && ./launcher.rb #{processors} 2>&1")

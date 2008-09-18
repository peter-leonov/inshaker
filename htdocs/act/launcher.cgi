#!/usr/bin/ruby

require 'rubygems'
require 'cgi'
$stdout.sync = true

cgi = CGI.new('html4')

processors = ""
cgi.params.each{|k,v| processors += "#{k} " if k =~ /^[a-z]+$/}

res = ""
IO.popen("cd /www/inshaker/barman && ./launcher.rb #{processors} 2>&1") { |f|
  until f.eof?
	  res += f.gets
  end
}
cgi.out { res }

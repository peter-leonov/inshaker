#!/usr/bin/ruby

require 'rubygems'
require 'cgi'
$stdout.sync = true

cgi = CGI.new('html4')

res = ""
IO.popen("cd /www/ && svn up 2>&1") { |f|
  until f.eof?
	  res += f.gets
  end
}
cgi.out { res }
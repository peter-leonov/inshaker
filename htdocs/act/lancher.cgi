#!/usr/bin/ruby

require 'rubygems'
require 'cgi'
$stdout.sync = true

cgi = CGI.new('html4')

processors = ""
cgi.params.each{|k,v| processors += "#{k} "}

res = ""
IO.popen("cd /www/inshaker/barman && export BARMAN_BASE_DIR=/Volumes/base/ && ./launcher.rb #{processors}") { |f|
  until f.eof?
	res += f.gets
  end
}

cgi.out {
  res
}

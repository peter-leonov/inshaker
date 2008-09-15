#!/usr/bin/ruby

require 'rubygems'
require 'cgi'
$stdout.sync = true

res = ""
IO.popen('cd /www/inshaker/barman && export BARMAN_BASE_DIR=/Volumes/base/ && ./launcher.rb') { |f|
  until f.eof?
	res += f.gets
  end
}

cgi = CGI.new('html4')

cgi.out {
	cgi.html {
		cgi.body {
			cgi.h1 { res }
		}
	}
}

#!/usr/bin/ruby
require 'inshaker'
require 'rubygems'
require 'cgi'
$stdout.sync = true

puts "Content-type: text/plain; charset=utf-8\n\n"

Dir.chdir("#{Inshaker::ROOT_DIR}barman/")

processors = []
CGI.new.params.each do |k, v|
  processors << k.to_s if k =~ /^[a-z]+$/
end

processors.each do |p|
  fork { exit system("./processors/#{p}.rb 2>>../inshaker.log") }
  Process.wait
end

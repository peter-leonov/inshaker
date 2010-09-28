#!/usr/bin/ruby

# redirect all output to stdout and make it unbuferred
$stderr = $stdout
$stdout.sync = true

require 'inshaker'
require 'rubygems'
require 'cgi'


puts "Content-type: text/plain; charset=utf-8\n\n"

puts "Запускаюсь…"

Dir.chdir("#{Inshaker::ROOT_DIR}barman/")

processors = []
CGI.new.params.each do |k, v|
  processors << k.to_s if k =~ /^[a-z]+$/
end

if processors.empty?
  puts "Нечего запускать."
  exit 1
end

processors.each do |p|
  puts "Запускаю #{p}"
  fork { exit system("./processors/#{p}.rb") }
  Process.wait
end

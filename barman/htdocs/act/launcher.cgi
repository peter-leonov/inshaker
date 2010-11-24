#!/usr/bin/env ruby1.9
# encoding: utf-8

# redirect all output to stdout and make it unbuferred
$stdout.sync = true
$stderr.reopen($stdout)

puts "Content-type: text/plain; charset=utf-8\n\n"

puts "Запускаюсь…"

require 'inshaker'
require 'rubygems'
require 'cgi'

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

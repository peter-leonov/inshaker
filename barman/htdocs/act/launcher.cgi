#!/usr/bin/env ruby1.9
# encoding: utf-8

# redirect all output to stdout and make it unbuferred
$stdout.sync = true
$stderr.reopen($stdout)

puts "Content-type: text/plain; charset=utf-8\n\n"

puts "Загружаюсь…"

require 'inshaker'
require 'rubygems'
require 'cgi'

Dir.chdir("#{Inshaker::ROOT_DIR}barman/")

scripts =
{
  "cocktails" => ["./processors/cocktails.rb", "Коктейли"],
  "ingredients" => ["./processors/ingredients.rb", "Ингредиенты"],
  "marks" => ["./processors/marks.rb", "Марки"],
  "tools" => ["./processors/tools.rb", "Штучки"],
  "bars" => ["./processors/bars.rb", "Бары"],
  "events" => ["./processors/events.rb", "События"],
  "barmen" => ["./processors/barmen.rb", "Барменов"],
  "goods" => ["./processors/goods.rb", "Покупки"],
  "magazine" => ["./processors/magazine.rb", "Журнал"],
  "deployer" => ["./deployer.rb", "Заливалку"]
}

processors = {}
CGI.new.params.each do |k, v|
  script = scripts[k]
  unless script
    puts "неизвестное действие #{k}"
  end
  processors[k] = script
end

if processors.empty?
  puts "Нечего запускать."
  exit 1
end

processors.each do |k, v|
  puts "Запускаю «#{v[1]}»"
  fork { exit system(v[0]) }
  Process.wait
end

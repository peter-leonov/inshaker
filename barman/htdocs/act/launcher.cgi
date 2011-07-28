#!/usr/bin/env ruby1.9
# encoding: utf-8

# redirect all output to stdout and make it unbuferred
$stdout.sync = true
$stderr.reopen($stdout)

puts "Content-type: text/plain; charset=utf-8\n\n"

require "config"

Dir.chdir("#{Inshaker::ROOT_DIR}barman/")

body = $stdin.read(ENV["CONTENT_LENGTH"].to_i)

# super light parser for url-encoded parameters
params = {}
body.split(/[&;]/).each do |pair|
  k, v = pair.split(/\=/)
  params[k] = v
end

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
  "blog" => ["./processors/blog.rb", "Блог"],
  "deployer" => ["./deployer.rb", "Заливалку"],
  "status" => ["./status.rb", "Статус"],
  "reset" => ["./reset.rb", "Сброс"]
}

processors = {}
params.each do |k, v|
  script = scripts[k]
  unless script
    puts "неизвестное действие #{k}"
    exit(1)
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

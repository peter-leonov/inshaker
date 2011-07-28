#!/usr/bin/env ruby1.9
# encoding: utf-8

# CGI-specific stuff
# redirect all output to stdout and make it unbuferred
$stdout.sync = true
$stderr.reopen($stdout)
puts "Content-type: text/plain; charset=utf-8\n\n"


require "config"

class Launcher
  
  module Config
    include Inshaker
    
    LOCKPATH = "#{ROOT_DIR}/#{LOCK_FILE}"
    
    SCRIPTS =
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
    
  end
  
  def launch
    
    params = parse_params
    
    processors = {}
    params.each do |k, v|
      script = Config::SCRIPTS[k]
      unless script
        puts "Ошибка: неизвестное действие #{k}."
        exit 1
      end
      processors[k] = script
    end
    
    if processors.empty?
      puts "Ошибка: нечего запускать."
      exit 1
    end
    
    unless lock
      puts "Ошибка: кто-то занял бармена."
      exit 1
    end
    processors.each do |k, v|
      run v
    end
    unlock
  end
  
  def lock
    begin
      Dir.mkdir(Config::LOCKPATH)
      true
    rescue => e
      false
    end
  end
  
  def unlock
    begin
      Dir.rmdir(Config::LOCKPATH)
      true
    rescue => e
      puts "Паника: #{e.to_s.force_encoding('UTF-8')}"
      false
    end
  end
  
  def run job
    puts "Запускаю «#{job[1]}»…"
    Dir.chdir("#{Config::ROOT_DIR}barman/")
    fork { exec job[0] }
    Process.wait
  end
  
  def parse_params
    body = $stdin.read(ENV["CONTENT_LENGTH"].to_i)
    
    # super light parser for url-encoded parameters
    hash = {}
    body.split(/[&;]/).each do |pair|
      k, v = pair.split(/\=/)
      hash[k] = v
    end
    
    return hash
  end
  
end

Launcher.new.launch

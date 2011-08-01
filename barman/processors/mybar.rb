#!/usr/bin/env ruby1.9
# encoding: utf-8
require "inshaker"
require "entities/ingredient"
require "entities/cocktail"
require "find"

class MyBarProcessor < Inshaker::Processor
  
  module Config
    DB_DIR  = "/www/db"
  end
  
  def initialize
    super
    
    @total = 0
    @playing = 0
    @hidden = 0
    
    @ingredients = {}
    @ingredients.default = 0
  end
  
  def job_name
    "смешивалку моего бара"
  end
  
  def job
    Ingredient.init
    
    update
    analyse
    report
    
    unless errors?
      # something
    end
  end
  
  def update
    Process.fork do
      Dir.chdir(Config::DB_DIR)
      Process.exec("git", "pull")
    end
    
    unless Process.wait2[1].exitstatus == 0
      error "не удалось получить последнюю версию базы моих баров"
      return
    end
  end
  
  def analyse
    say "анализирую мои бары"
    
    Find.find(Config::DB_DIR) do |fname|
      m = fname.match(/\/([^\/]+)\/bar.json/)
      next unless m
      if /bar.json$/ =~ fname
        id = m[1]
        # say id
        # indent do
        process File.open(fname), id
        # end # indent
      end
    end
  end
  
  def process f, id
    @total += 1
    begin
      data = JSON.parse(f.read)
    rescue Exception => e
      warning "не могу разобрать данные бара “#{id}”"
      return
    end
    
    unless data["ingredients"].empty?
      @playing += 1
      process_ingredients data["ingredients"]
    end
    
    unless data["hiddenCocktails"].empty?
      @hidden += 1
    end
  end
  
  def process_ingredients ingredients
    ingredients.each do |name|
      @ingredients[name] += 1
    end
  end
  
  def report
    def percent a, b=@playing
      (100.0 * a / b).round(1)
    end
    say "всего баров: #{@total}"
    say "играющих: #{@playing} (#{percent @playing, @total}%)"
    say "далее % считаются от играющих (непустых) баров"
    say "прячут коктейли: #{@hidden} (#{percent @hidden}%)"
    
    ingredients_top = @ingredients.keys
    ingredients_top.sort! { |a, b| @ingredients[b] - @ingredients[a] }
    say "топ ингредиентов:"
    indent do
      ingredients_top[0..10].each do |name|
        say "#{name}: #{@ingredients[name]} (#{percent @ingredients[name]}%)"
      end
    end
    
  end
end

exit MyBarProcessor.new.run
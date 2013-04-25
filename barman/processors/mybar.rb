#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

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
    @ingredients_deleted = {}
    @ingredients_deleted.default = 0
    
    @cocktails = {}
    @cocktails.default = 0
    @cocktails_deleted = {}
    @cocktails_deleted.default = 0
    @cocktails_ingredients_used = {}
    @cocktails_ingredients_used.default = 0
    @cocktails_ingredients_unused = {}
    @cocktails_ingredients_unused.default = 0
  end
  
  def job_name
    "смешивалку моего бара"
  end
  
  def job
    Ingredient.init
    Cocktail.init
    
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
    say "собираю список"
    all = []
    Find.find(Config::DB_DIR) do |fname|
      m = fname.match(/\/([^\/]+)\/bar.json/)
      next unless m
      if /bar.json$/ =~ fname
        id = m[1]
        all << [fname, id]
      end
    end
    
    l = all.length
    say "анализирую #{l} #{l.plural("мой бар", "моих бара", "моих баров")}"
    last = 0
    all.each_with_index do |v, i|
      now = (100.0 * (i + 1) / l).to_i
      if now % 10 == 0 and last != now
        say "#{now}%"
        last = now
      end
      process File.open(v[0]), v[1]
    end
  end
  
  def process f, id
    begin
      data = JSON.parse(f.read)
    rescue Exception => e
      warning "не могу разобрать данные бара “#{id}”"
      return
    end
    
    @total += 1
    
    unless data["ingredients"].empty?
      @playing += 1
      process_ingredients data["ingredients"]
      process_cocktails data["ingredients"]
    end
    
    unless data["hiddenCocktails"].empty?
      @hidden += 1
    end
  end
  
  def process_ingredients ingredients
    ingredients.each do |name|
      @ingredients[name] += 1
      unless Ingredient[name]
        @ingredients_deleted[name] += 1
      end
    end
  end
  
  def process_cocktails ingredients
    cocktails = Cocktail.by_ingredients(ingredients)
    
    ingredients_used = {}
    cocktails.each do |cname|
      @cocktails[cname] += 1
      
      cocktail = Cocktail[cname]
      unless cocktail
        @cocktails_deleted[cname] += 1
        next
      end
      
      cocktail["ingredients"].each do |iname|
        ingredients_used[iname[0]] = true
      end
    end
    
    ingredients_used.keys.each do |iname|
      @cocktails_ingredients_used[iname] += 1
    end
    
    (ingredients - ingredients_used.keys).each do |iname|
      @cocktails_ingredients_unused[iname] += 1
    end
  end
  
  def report
    def percent a, b=@playing
      (100.0 * a / b).round(1)
    end
    
    say ""
    say "Бары"
    indent do
      say "всего баров: #{@total}"
      say "играющих: #{@playing} (#{percent @playing, @total}%)"
      say "далее % считаются от играющих (непустых) баров"
      say "прячут коктейли: #{@hidden} (#{percent @hidden}%)"
    end
    
    say ""
    say "Ингредиенты"
    indent do
      ingredients_top = @ingredients.keys
      ingredients_top.sort! { |a, b| @ingredients[b] - @ingredients[a] }
      say "топ добавленных ингредиентов:"
      indent do
        ingredients_top[0..10].each do |name|
          say "#{name}: #{@ingredients[name]} (#{percent @ingredients[name]}%)"
        end
      end
      
      ingredients_top = @cocktails_ingredients_used.keys
      ingredients_top.sort! { |a, b| @cocktails_ingredients_used[b] - @cocktails_ingredients_used[a] }
      say "топ используемых ингредиентов:"
      indent do
        ingredients_top[0..10].each do |name|
          say "#{name}: #{@cocktails_ingredients_used[name]} (#{percent @cocktails_ingredients_used[name]}%)"
        end
      end
      
      ingredients_top = @cocktails_ingredients_unused.keys
      ingredients_top.sort! { |a, b| @cocktails_ingredients_unused[b] - @cocktails_ingredients_unused[a] }
      say "топ неиспользуемых ингредиентов:"
      indent do
        ingredients_top[0..10].each do |name|
          say "#{name}: #{@cocktails_ingredients_unused[name]} (#{percent @cocktails_ingredients_unused[name]}%)"
        end
      end
      
      say "есть в барах, но нет на сайте: #{@ingredients_deleted.keys.join(", ")}"
    end
    
    say ""
    say "Коктейли"
    indent do
      cocktails_top = @cocktails.keys
      cocktails_top.sort! { |a, b| @cocktails[b] - @cocktails[a] }
      say "топ коктейлей:"
      indent do
        cocktails_top[0..30].each do |name|
          say "#{name}: #{@cocktails[name]} (#{percent @cocktails[name]}%)"
        end
      end
    end
    
    
  end
end

exit MyBarProcessor.new.run
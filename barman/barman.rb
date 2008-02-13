require 'rubygems'
require 'active_support'
require "erb"

require "string_util"
$KCODE = 'u'

require 'entities'

class Barman

  def initialize
    @cocktails   = {}
    @tags        = []
    @ingredients = []
    @strengths   = []
    @tools       = []
  end
  
  def prepare
    root = Dir.new(Dir.pwd + "/cocktails/")
    excluded = [root.path + ".", root.path + ".."]
    
    root.each do |dir|
      cocktail_dir = root.path + dir
      if File.ftype(cocktail_dir) == "directory" and !excluded.include?(cocktail_dir)
        Dir.chdir(cocktail_dir)
        about_text = File.open(cocktail_dir + "/about.txt").read
        
        @cocktail               = {}
        @cocktail[:tags]        = []
        @cocktail[:tools]       = []
        @cocktail[:ingredients] = []
        
        parse_title (about_text.scan /.*Название:\ *\n(.+)\n.*/)[0][0]
        parse_teaser (about_text.scan /.*Тизер:\ (.+)\ *\n.*/)[0][0]
        parse_strength (about_text.scan /.*Крепость:\ *\n(.+)\ *\n.*/)[0][0]
        parse_tags (about_text.scan /.*Группы:\ *\n(.+)\n\nИнгредиенты.*/m)[0][0]
        parse_ingredients (about_text.scan /.*Ингредиенты:\ *\n(.+)\n\nШтучки.*/m)[0][0]
        parse_tools (about_text.scan /.*Штучки:\ *\n(.+)\n\nКак приготовить.*/m)[0][0]
        parse_receipt (about_text.scan /.*Как приготовить:\ *\n(.+)*/m)[0][0]
        parse_description File.open(cocktail_dir + "/legend.txt").read
        @cocktails[@cocktail[:name]] = @cocktail
        Dir.chdir("../")
      end
    end
    Dir.chdir("../")
  end
  
  def flush_json
     cocktails_json   = ActiveSupport::JSON.encode(@cocktails).unescape
     ingredients_json = ActiveSupport::JSON.encode(@ingredients).unescape
     tags_json        = ActiveSupport::JSON.encode(@tags).unescape
     strengths_json   = ActiveSupport::JSON.encode(@strengths).unescape
     tools_json       = ActiveSupport::JSON.encode(@tools).unescape
     
     File.open("db.js", "w+") do |db|
      db.puts "\nvar cocktails = #{cocktails_json};"
      db.puts "\nvar ingredients = #{ingredients_json};"
      db.puts "\nvar tags = #{tags_json};"
      db.puts "\nvar strengths = #{strengths_json};"
      db.puts "\nvar tools = #{tools_json};"
      db.close
     end
  end
  
  def flush_html
    template = File.open("cocktail_template.html.erb").read
    renderer = ERB.new(template)
    @cocktails.each do |name, hash|
      cocktail = Cocktail.new(hash)
      Dir.chdir("html")
      File.open(hash[:name_eng].downcase.gsub(/ /,"_")+".html", "w+") do |html|
        html.write renderer.result(cocktail.get_binding)
      end
      Dir.chdir("../")
    end
  end

private
  
  def parse_title(title)
    @cocktail[:name], @cocktail[:name_eng] = title.split("; ")
  end
  
  def parse_teaser(teaser)
    @cocktail[:teaser] = teaser
  end
  
  def parse_strength(strength)
    if !@strengths.include? strength
      @strengths << strength
    end
    @cocktail[:strength] = strength
  end
  
  def parse_tags(tags)
    tags = tags.split("\n")
    tags.each do |tag|
      if !@tags.include? tag
        @tags << tag
      end
      @cocktail[:tags] << tag
    end
  end
  
  def parse_ingredients(ingredients)
    ingredients = ingredients.split("\n")
    ingredients.each do |ing|
      name, dose = ing.split(": ")
      if !@ingredients.include? name
        @ingredients << name
      end
      @cocktail[:ingredients] << [name, dose]
    end
  end
  
  def parse_tools(tools)
    tools = tools.split("\n")
    tools.each do |tool|
      if !@tools.include? tool
        @tools << tool
      end
      @cocktail[:tools] << tool
    end
  end
  
  def parse_receipt(receipt)
    @cocktail[:receipt] = receipt.split("\n")
  end
  
  def parse_description(text)
    words = text.split(" ")
    cut = 40
    desc_start = (words.length > cut) ? words[0..cut].join(" ") : text
    desc_end   = (words.length > cut) ? words[cut+1..words.length-1].join(" ") : ""
    @cocktail[:desc_start], @cocktail[:desc_end] = desc_start, desc_end
  end
end

puts "Creating a barman..."
joe = Barman.new
puts "Preparing data..."
joe.prepare
puts "Flushing JSON to db.js..."
joe.flush_json
puts "Flushing HTML to html/..."
joe.flush_html
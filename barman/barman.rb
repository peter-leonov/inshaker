require 'rubygems'
require 'active_support'
require 'unicode'
require 'fileutils'
require 'erb'

require 'string_util'
$KCODE = 'u'

require 'entities'

module Config
  DEBUG = true
  
  # Paths are relative to the script's location
  BASE_DIR      = "base/"
  HTDOCS_DIR    = "../htdocs/"
  COCKTAILS_DIR = HTDOCS_DIR + "cocktails/"
  DB_JS         = HTDOCS_DIR + "js/db.js"
  IMAGES_ROOT   = HTDOCS_DIR + "i/cocktail/"
  
  IMAGES_BG_DIR    = IMAGES_ROOT + "bg/"
  IMAGES_BIG_DIR   = IMAGES_ROOT + "b/"
  IMAGES_SMALL_DIR = IMAGES_ROOT + "s/"
  
  TEMPLATES_DIR = "templates/"
  COCKTAIL_ERB  = TEMPLATES_DIR + "cocktail.rhtml"
end

class Barman

  def initialize
    @cocktails   = {}
    @tags        = []
    @ingredients = []
    @strengths   = []
    @tools       = []
  end
  
  def prepare
    root = Dir.new(Dir.pwd + "/" + Config::BASE_DIR)
    excluded = [root.path + ".", root.path + "..", root.path + ".svn"]
    
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
     
     File.open(Config::DB_JS, "w+") do |db|
      db.puts "\nvar cocktails = #{cocktails_json};"
      db.puts "\nvar ingredients = #{ingredients_json};"
      db.puts "\nvar tags = #{tags_json};"
      db.puts "\nvar strengths = #{strengths_json};"
      db.puts "\nvar tools = #{tools_json};"
      db.close
     end
  end
  
  def flush_html
    template = File.open(Config::COCKTAIL_ERB).read
    renderer = ERB.new(template)
    @cocktails.each do |name, hash|
      cocktail = Cocktail.new(hash)
      Dir.chdir(Config::COCKTAILS_DIR)
      File.open(hash[:name_eng].html_name + ".html", "w+") do |html|
        html.write renderer.result(cocktail.get_binding)
      end
      Dir.chdir("../")
    end
    Dir.chdir("../barman/")
  end
  
  def flush_images
    @cocktails.each do |name, hash|
      from     = Dir.pwd + "/" + Config::BASE_DIR + hash[:name_eng] + "/"
      to_big   = Config::IMAGES_BIG_DIR   + hash[:name_eng].html_name + ".png"
      to_small = Config::IMAGES_SMALL_DIR + hash[:name_eng].html_name + ".png"
      to_bg    = Config::IMAGES_BG_DIR    + hash[:name_eng].html_name + ".png"
      opt = {:remove_destination => true}
      FileUtils.cp_r(from + "big.png", to_big, opt)     unless !File.exists?(from + "big.png")
      FileUtils.cp_r(from + "small.png", to_small, opt) unless !File.exists?(from + "small.png")
      FileUtils.cp_r(from + "bg.png", to_bg, opt)       unless !File.exists?(from + "bg.png")
    end
  end

private
  
  def parse_title(title)
    @cocktail[:name], @cocktail[:name_eng] = title.split("; ")
    if Config::DEBUG then puts "..#{@cocktail[:name_eng]}" end
  end
  
  def parse_teaser(teaser)
    @cocktail[:teaser] = teaser
  end
  
  def parse_strength(strength)
    if !@strengths.include? strength.downcase
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
    paragraphs = text.split("\n")
    @cocktail[:desc_start] = paragraphs.first
    @cocktail[:desc_end]   = paragraphs[1..-1].join ""
  end
end

puts "Creating a barman.."
joe = Barman.new
puts "Mixing cocktails from #{Config::BASE_DIR}"
joe.prepare
puts "Flushing JSON to #{Config::DB_JS}"
joe.flush_json
puts "Flushing HTML to #{Config::COCKTAILS_DIR}"
joe.flush_html
puts "Flushing images to #{Config::IMAGES_ROOT}"
joe.flush_images
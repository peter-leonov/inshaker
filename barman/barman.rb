require 'rubygems'
require 'active_support'
require 'unicode'
require 'fileutils'
require 'erb'
require 'csv'
require 'string_util'
require 'entities'
$KCODE = 'u'


module Config
  # Paths are relative to the script's location
  BASE_DIR           = "base/"
  COCKTAILS_DIR      = BASE_DIR + "Cocktails/"
  MERCH_DIR          = BASE_DIR + "Merchandise/"
  TOOLS_DIR          = MERCH_DIR + "Tools/"
  
  HTDOCS_DIR         = "../htdocs/"
  COCKTAILS_HTML_DIR = HTDOCS_DIR + "cocktails/"
  DB_JS_DIR          = HTDOCS_DIR + "js/common/db.js"
  
  IMAGES_DIR       = HTDOCS_DIR + "i/cocktail/"
  IMAGES_BG_DIR    = IMAGES_DIR + "bg/"
  IMAGES_BIG_DIR   = IMAGES_DIR + "b/"
  IMAGES_SMALL_DIR = IMAGES_DIR + "s/"
  
  VIDEOS_DIR = HTDOCS_DIR + "v/"
  
  MERCH_ROOT    = HTDOCS_DIR + "i/merchandise/"
  INGREDS_DIR   = MERCH_ROOT + "ingredients/"
  VOLUMES_DIR   = MERCH_ROOT + "volumes/"
  BANNERS_DIR   = MERCH_ROOT + "banners/"
  TOOLS_ROOT    = MERCH_ROOT + "tools/"
  
  TEMPLATES_DIR = "templates/"
  COCKTAIL_ERB  = TEMPLATES_DIR + "cocktail.rhtml"
end

class Barman

  def initialize(debug)
    @debug = debug
    
    @cocktails   = {}
    @tags        = []
    @ingredients = []
    @strengths   = []
    @tools       = {}
    @goods       = {}
  end
  
  def prepare
    root = Dir.new(Dir.pwd + "/" + Config::COCKTAILS_DIR)
    excluded = [root.path + ".", root.path + "..", root.path + ".svn", root.path + ".TemporaryItems", root.path + "Merchandise"]
    
    root.each do |dir|
      cocktail_dir = root.path + dir
      if File.ftype(cocktail_dir) == "directory" and !excluded.include?(cocktail_dir)
        Dir.chdir(cocktail_dir)
        
        @cocktail               = {}
        @cocktail[:tags]        = []
        @cocktail[:tools]       = []
        @cocktail[:ingredients] = []
        @cocktail[:has_video]   = false
        
        parse_about_text  File.open(cocktail_dir + "/about.txt").read
        parse_legend_text File.open(cocktail_dir + "/legend.txt").read
        
        if File.exists? cocktail_dir + "/video.flv" then @cocktail[:has_video] = true end
        @cocktails[@cocktail[:name]] = @cocktail
        
        Dir.chdir("../")
      end
    end
    Dir.chdir("../../") # back from cocktails dir to barman root
    Dir.chdir(Config::MERCH_DIR)
      parse_goods (File.open("Merchandise-drinks.csv").read)
    Dir.chdir("../../") # back from merch dir to barman root
  end
  
  def flush_json     
     cocktails_json   = ActiveSupport::JSON.encode(@cocktails).unescape
     ingredients_json = ActiveSupport::JSON.encode(@ingredients).unescape
     tags_json        = ActiveSupport::JSON.encode(@tags).unescape
     strengths_json   = ActiveSupport::JSON.encode(@strengths).unescape
     tools_json       = ActiveSupport::JSON.encode(@tools).unescape
     goods_json       = ActiveSupport::JSON.encode(@goods).unescape
     
     File.open(Config::DB_JS_DIR, "w+") do |db|
      db.puts "var cocktails = #{cocktails_json};"
      db.puts "var ingredients = #{ingredients_json};"
      db.puts "var tags = #{tags_json};"
      db.puts "var strengths = #{strengths_json};"
      db.puts "var tools = #{tools_json};"
      db.puts "var goods = #{goods_json};"
      db.close
     end
  end
  
  def flush_html
    template = File.open(Config::COCKTAIL_ERB).read
    renderer = ERB.new(template)
    @cocktails.each do |name, hash|
      cocktail = Cocktail.new(hash)
      Dir.chdir(Config::COCKTAILS_HTML_DIR)
      File.open(hash[:name_eng].html_name + ".html", "w+") do |html|
        html.write renderer.result(cocktail.get_binding)
      end
      Dir.chdir("../")
    end
    Dir.chdir("../barman/")
  end
  
  def flush_images
    opt = {:remove_destination => true}
    @cocktails.each do |name, hash|
      from = Dir.pwd + "/" + Config::COCKTAILS_DIR + hash[:name_eng] + "/"
      
      to_big   = Config::IMAGES_BIG_DIR   + hash[:name_eng].html_name + ".png"
      to_small = Config::IMAGES_SMALL_DIR + hash[:name_eng].html_name + ".png"
      to_bg    = Config::IMAGES_BG_DIR    + hash[:name_eng].html_name + ".png"
      FileUtils.cp_r(from + "big.png", to_big, opt)     unless !File.exists?(from + "big.png")
      FileUtils.cp_r(from + "small.png", to_small, opt) unless !File.exists?(from + "small.png")
      FileUtils.cp_r(from + "bg.png", to_bg, opt)       unless !File.exists?(from + "bg.png")
    end
  end
  
  def flush_videos
    opt = {:remove_destination => true}
    @cocktails.each do |name, hash|
      from = Dir.pwd + "/" + Config::COCKTAILS_DIR + hash[:name_eng] + "/video.flv"
      to = Config::VIDEOS_DIR + hash[:name_eng].html_name + ".flv"
      FileUtils.cp_r(from, to, opt) unless !File.exists?(from)
    end
  end
  
  def flush_tools
    opt = {:remove_destination => true}
    @tools.each do |tool, desc|
      from = Dir.pwd + "/" + Config::TOOLS_DIR + tool + "/image.png"
      to   = Config::TOOLS_ROOT + tool.trans + ".png"
      FileUtils.cp_r(from, to, opt) unless !File.exists?(from)
    end
  end
  
  def flush_goods
    opt = {:remove_destination => true}
    @goods.each do |ingredient, arr|
      arr.each do |good|        
        if good[:brand].empty? # unbranded
          unbranded_dir = Dir.pwd + "/" + Config::MERCH_DIR + ingredient + "/"

          from_big   = unbranded_dir + "i_big.png"
          from_small = unbranded_dir + "i_small.png"
          
          to_big     = Config::INGREDS_DIR + ingredient.trans + "_big.png"
          to_small   = Config::INGREDS_DIR + ingredient.trans + "_small.png"

          FileUtils.cp_r(from_big, to_big, opt)     unless !File.exists?(from_big)
          FileUtils.cp_r(from_small, to_small, opt) unless !File.exists?(from_small)
          
          good[:volumes].each do |vol_arr|
            vol_name   = vol_arr[0].to_s.gsub(".", "_")
            from_big   = unbranded_dir + vol_name + "_big.png"
            from_small = unbranded_dir + vol_name + "_small.png"
            
            to_big   = Config::VOLUMES_DIR + ingredient.trans + "_" + vol_name + "_big.png"
            to_small = Config::VOLUMES_DIR + ingredient.trans + "_" + vol_name + "_small.png"
            
            FileUtils.cp_r(from_big, to_big, opt)     unless !File.exists?(from_big)
            FileUtils.cp_r(from_small, to_small, opt) unless !File.exists?(from_small)
          end
        else # brand-name goods
          from_dir = Dir.pwd + "/" + Config::MERCH_DIR + ingredient + "/" + good[:brand] + "/"
          
          from_banner = from_dir + "banner.png"
          from_big    = from_dir + "i_big.png"
          from_small  = from_dir + "i_small.png"
          
          puts "..#{ingredient}" unless !@debug
          to_big    = Config::INGREDS_DIR + ingredient.trans + "_big.png"
          to_small  = Config::INGREDS_DIR + ingredient.trans + "_small.png"  
          to_banner = Config::BANNERS_DIR + good[:mark].trans + ".png"
          
          FileUtils.cp_r(from_banner, to_banner, opt) unless !File.exists?(from_banner)
          FileUtils.cp_r(from_big, to_big, opt)       unless !File.exists?(from_big)
          FileUtils.cp_r(from_small, to_small, opt)   unless !File.exists?(from_small)
          
          good[:volumes].each do |vol_arr|
            vol_name   = vol_arr[0].to_s.gsub(".", "_")
            from_big   = from_dir + vol_name + "_big.png"
            from_small = from_dir + vol_name + "_small.png"
            
            to_big   = Config::VOLUMES_DIR + good[:brand].trans + "_" + vol_name + "_big.png"
            to_small = Config::VOLUMES_DIR + good[:brand].trans + "_" + vol_name + "_small.png"
            
            FileUtils.cp_r(from_big, to_big, opt)     unless !File.exists?(from_big)
            FileUtils.cp_r(from_small, to_small, opt) unless !File.exists?(from_small)
          end
        end
      end
    end
  end

private

  def parse_about_text(about_text)
    parse_title (about_text.scan /.*Название:\ *\n(.+)\n.*/)[0][0]
    parse_teaser (about_text.scan /.*Тизер:\ (.+)\ *\n.*/)[0][0]
    parse_strength (about_text.scan /.*Крепость:\ *\n(.+)\ *\n.*/)[0][0]
    if (about_text.scan /.*Группы:\ *\n(.+)\n\nИнгредиенты.*/m) != [] # empty
      parse_tags (about_text.scan /.*Группы:\ *\n(.+)\n\nИнгредиенты.*/m)[0][0]
    else
      parse_tags ""
    end
    parse_ingredients (about_text.scan /.*Ингредиенты:\ *\n(.+)\n\nШтучки.*/m)[0][0]
    parse_tools (about_text.scan /.*Штучки:\ *\n(.+)\n\nКак приготовить.*/m)[0][0]
    parse_receipt (about_text.scan /.*Как приготовить:\ *\n(.+)*/m)[0][0]
  end
  
  def parse_title(title)
    @cocktail[:name], @cocktail[:name_eng] = title.split("; ")
    if @debug then puts "..#{@cocktail[:name_eng]}" end
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
    if tags == ""
      @cocktail[:tags] = []
      return
    end
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
      @cocktail[:ingredients] << [name, dose.zpt]
    end
  end
  
  def parse_tools(tools)
    tools = tools.split("\n")
    tools.each do |tool|
      if !@tools.has_key? tool
        @tools[tool] = get_tool_desc(tool)
      end
      @cocktail[:tools] << tool
    end
  end
  
  def parse_receipt(receipt)
    res = []
    lines = receipt.split("\n")
    lines.each do |line|
      letters = line.split("")
      if(letters[0] != letters[0].downcase)
        res.push line
      else
        idx = res.index res.last
        res[idx] = res[idx] + " " + line
      end
    end
    @cocktail[:receipt] = res
  end
  
  def parse_legend_text(text)
    paragraphs = text.split(%r{[\n\r]})
    @cocktail[:desc_start] = paragraphs.first
    @cocktail[:desc_end]   = paragraphs[1..-1].join "\n"
  end
  
  def parse_goods(text)
    csv = CSV::parse(text)
    csv.shift # shifting through fields
    
    goods_arr = []
    good = {}
    ingredient = ""
    
    csv.each do |line|
      if !line[0].nil? # new drink
        goods_arr = []
        good = {}
        ingredient = line[0]
        good[:brand] = line[1].nil? ? "" : line[1]
        good[:mark]  = line[2].nil? ? "" : line[2]
        good[:unit] = line[3]
        good[:volumes] = []
        good[:desc] = get_desc(ingredient, good[:brand])
        goods_arr << good
        @goods[ingredient] = goods_arr
      elsif line[0].nil? and line[1].nil? and line[2].nil? # volumes
        vol = line[4].nil? ? "" : line[4].zpt.to_f
        price = line[5].to_f
        avail = (line[6] == "есть") ? true : false
        good[:volumes] << [vol, price, avail]
      elsif !line[1].nil? # drink of the same ingredient
        good = {}
        good[:brand] = line[1].nil? ? "" : line[1]
        good[:mark]  = line[2].nil? ? "" : line[2]
        good[:unit] = line[3]
        good[:volumes] = []
        good[:desc] = get_desc(ingredient, good[:brand])
        goods_arr << good
      end
    end
  end
  
  def get_tool_desc(tool)
    old_dir = Dir.pwd
    Dir.chdir "../../../" + Config::TOOLS_DIR + tool
    desc = File.exists?("about.txt") ? File.open("about.txt").read.html_paragraphs : ""
    Dir.chdir old_dir
    return desc
  end
  
  def get_desc(ingredient, brand)
    dir  = Dir.pwd + "/" + ingredient + "/"
    dir += (brand.empty?) ? "" : brand + "/"
    desc =  File.exists?(dir + "about.txt") ? File.open(dir + "about.txt").read : ""
    return desc
  end 
  
end

def go
  debug = !(ARGV[0] == "-silent")
  joe = Barman.new(debug)
  puts "Mixing cocktails from #{Config::COCKTAILS_DIR}" 
  joe.prepare                                           
  puts "Flushing JSON to #{Config::DB_JS_DIR}"          
  joe.flush_json                                        
  puts "Flushing HTML to #{Config::COCKTAILS_HTML_DIR}" 
  joe.flush_html                                        
  puts "Flushing images to #{Config::IMAGES_DIR}"       
  joe.flush_images                                      
  puts "Flushing videos to #{Config::VIDEOS_DIR}"       
  joe.flush_videos                                      
  puts "Flushing goods to #{Config::MERCH_ROOT}"        
  joe.flush_goods
  puts "Flushing tools to #{Config::TOOLS_ROOT}"
  joe.flush_tools
end

# Here 
# we
  go

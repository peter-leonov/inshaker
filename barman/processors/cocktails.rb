#!/usr/bin/ruby
require 'barman'

class CocktailsProcessor < Barman::Processor

  module Config
    COCKTAILS_DIR = Barman::BASE_DIR + "Cocktails/"
    HTDOCS_DIR    = Barman::HTDOCS_DIR
    
    COCKTAILS_HTML_DIR = HTDOCS_DIR + "cocktails/"
    DB_JS              = HTDOCS_DIR + "db/cocktails.js"
    DB_JS_TAGS         = HTDOCS_DIR + "db/tags.js"
    DB_JS_STRENGTHS    = HTDOCS_DIR + "db/strengths.js"

    IMAGES_DIR       = HTDOCS_DIR + "i/cocktail/"
    IMAGES_BG_DIR    = IMAGES_DIR + "bg/"
    IMAGES_BIG_DIR   = IMAGES_DIR + "b/"
    IMAGES_SMALL_DIR = IMAGES_DIR + "s/"
    IMAGES_PRINT_DIR = IMAGES_DIR + "print/"

    VIDEOS_DIR = HTDOCS_DIR + "v/"

    COCKTAIL_ERB  = Barman::TEMPLATES_DIR + "cocktail.rhtml"
  end

  def initialize
    super    
    @cocktails = {}
    @tags      = []
    @strengths = []
  end
  
  def prepare_cocktails
    root = Dir.new(Config::COCKTAILS_DIR)
    
    root.each do |dir|
      cocktail_dir = root.path + dir
      if File.ftype(cocktail_dir) == "directory" and !@excl.include?(dir)
        
        @cocktail               = {}
        @cocktail[:tags]        = []
        @cocktail[:tools]       = []
        @cocktail[:ingredients] = []
        @cocktail[:has_video]   = false
        
        parse_about_text  File.open(cocktail_dir + "/about.txt").read
        parse_legend_text File.open(cocktail_dir + "/legend.txt").read
        
        if File.exists? cocktail_dir + "/video.flv" then @cocktail[:has_video] = true end
        @cocktails[@cocktail[:name]] = @cocktail
      end
    end
  end
  
  def prepare_tags_and_strengths
    order = YAML::load(File.open("#{Config::COCKTAILS_DIR}/tags.yaml"))
    order.each do |name, num|
      @tags[num-1] = name
    end
    
    order = YAML::load(File.open("#{Config::COCKTAILS_DIR}/strengths.yaml"))
    order.each do |name, num|
      @strengths[num-1] = name
    end
  end
  
  def flush_json
     @cocktails.each do |name, hash|
      hash.delete(:desc_start)
      hash.delete(:desc_end)
     end
     
     flush_json_object(@cocktails, Config::DB_JS)
     flush_json_object(@tags, Config::DB_JS_TAGS)
     flush_json_object(@strengths, Config::DB_JS_STRENGTHS)
  end
  
  def flush_html
    template = File.open(Config::COCKTAIL_ERB).read
    renderer = ERB.new(template)
    @cocktails.each do |name, hash|
      cocktail = CocktailTemplate.new(hash)
      File.open(Config::COCKTAILS_HTML_DIR + hash[:name_eng].html_name + ".html", "w+") do |html|
        html.write renderer.result(cocktail.get_binding)
      end
    end
  end
  
  def flush_images
    @cocktails.each do |name, hash|
      from = Config::COCKTAILS_DIR + hash[:name_eng] + "/"
      
      to_big   = Config::IMAGES_BIG_DIR   + hash[:name_eng].html_name + ".png"
      to_small = Config::IMAGES_SMALL_DIR + hash[:name_eng].html_name + ".png"
      to_bg    = Config::IMAGES_BG_DIR    + hash[:name_eng].html_name + ".png"
      to_print = Config::IMAGES_PRINT_DIR + hash[:name_eng].html_name + ".jpg"
      
      FileUtils.cp_r(from + "big.png", to_big, @mv_opt)     unless !File.exists?(from + "big.png")
      FileUtils.cp_r(from + "small.png", to_small, @mv_opt) unless !File.exists?(from + "small.png")
      FileUtils.cp_r(from + "bg.png", to_bg, @mv_opt)       unless !File.exists?(from + "bg.png")
      
      flush_print_img(from + "big.png", to_print, [106, 210])
      #system("/usr/local/bin/optipng " + to_small + " > /dev/null")
    end
  end
  
  def flush_videos
    @cocktails.each do |name, hash|
      from = Config::COCKTAILS_DIR + hash[:name_eng] + "/video.flv"
      to = Config::VIDEOS_DIR + hash[:name_eng].html_name + ".flv"
      FileUtils.cp_r(from, to, @mv_opt) unless !File.exists?(from)
    end
  end
  
  def run
    prepare_cocktails
    prepare_tags_and_strengths
    
    flush_html
    flush_images
    flush_videos
    flush_json
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
    puts "..#{@cocktail[:name_eng]}"
  end
  
  def parse_teaser(teaser)
    @cocktail[:teaser] = teaser
  end
  
  def parse_strength(strength)
    strength = strength.trim
    @cocktail[:strength] = strength
    if(!@strengths.include?(strength)) then @strengths << strength end
  end
  
  def parse_tags(tags)
    if tags == ""
      @cocktail[:tags] = []
      return
    end
    tags = tags.split("\n")
    tags.each do |tag|
      tag = tag.trim
      @cocktail[:tags] << tag
      if(!@tags.include?(tag)) then @tags << tag end
    end
  end
  
  def parse_ingredients(ingredients)
    ingredients = ingredients.split("\n")
    ingredients.each do |ing|
      name, dose = ing.split(": ")
      @cocktail[:ingredients] << [name, dose.zpt]
    end
  end
  
  def parse_tools(tools)
    tools = tools.split("\n")
    tools.each do |tool|
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
  
end

CocktailsProcessor.new.run
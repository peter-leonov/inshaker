# encoding: utf-8
require "entities/ingredient"
class Cocktail < Inshaker::Entity
  module Config
    COCKTAILS_DIR = Inshaker::BASE_DIR + "Cocktails/"
    HTDOCS_DIR    = Inshaker::HTDOCS_DIR
    
    HTDOCS_ROOT        = HTDOCS_DIR + "cocktail/"
    DB_JS              = HTDOCS_DIR + "db/cocktails/cocktails.json"
    DB_JS_TAGS         = HTDOCS_DIR + "db/cocktails/tags.json"
    DB_JS_GROUPS       = HTDOCS_DIR + "db/cocktails/groups.json"
    DB_JS_STRENGTHS    = HTDOCS_DIR + "db/cocktails/strengths.json"
    DB_JS_METHODS      = HTDOCS_DIR + "db/cocktails/methods.json"
    
    
    NOSCRIPT_LINKS     = HTDOCS_ROOT + "links.html"
    SITEMAP_LINKS      = HTDOCS_ROOT + "sitemap.txt"
    
    SEO_GROUPS_PATH    = HTDOCS_DIR + "gruppy-kokteyley/%s/list.html"
    
    VIDEOS_DIR = HTDOCS_DIR + "v/"
    
    COCKTAIL_ERB  = Inshaker::TEMPLATES_DIR + "cocktail.rhtml"
  end
  
  def self.init
    return if @inited
    @inited = true
    
    Ingredient.init
    
    @db = []
    JSON.parse(File.read(Config::DB_JS)).each do |name, cocktail|
      @db << cocktail
    end
    
    @tags = JSON.parse(File.read(Config::DB_JS_TAGS))
    
    @by_tag = Hash.new { |h, k| h[k] = [] }
    @db.each do |cocktail|
      cocktail["tags"].each do |tag|
        @by_tag[tag.ci_index] << cocktail
      end
    end
    @by_name = @db.hash_index("name")
  end
  
  def self.index_names_by_ingredient
    return if @names_by_ingredient
    
    @names_by_ingredient = Hash.new { |h, k| h[k] = [] }
    @db.each do |cocktail|
      cocktail["ingredients"].each do |part|
        @names_by_ingredient[part[0]] << cocktail["name"]
      end
    end
  end
  
  def self.known_tag? tag
    @tags.index(tag)
  end
  
  def self.get_by_tag tag
    @by_tag[tag.ci_index]
  end
  
  def self.check_integrity
    say "проверяю связность данных коктейлей"
    indent do
    @db.each do |cocktail|
      indent cocktail["name"] do
      cocktail["ingredients"].each do |part|
        errors = []
        unless Ingredient[part[0]]
          errors << part[0]
        end
        unless errors.empty?
          error "#{errors.length.plural("нет такого ингредиента", "нет таких ингредиентов", "нет таких ингредиентов")}: #{errors.join(", ")}"
        end
      end
      end # indent
    end
    end #indent
  end
  
  def self.by_ingredients ingredients
    index_names_by_ingredient
    
    partly = {}
    partly.default = 0
    
    ingredients.each do |iname|
      @names_by_ingredient[iname].each do |cname|
        partly[cname] += 1
      end
    end
    
    full = []
    partly.each do |cname, count|
      cocktail = Cocktail[cname]
      if cocktail["ingredients"].length == count
        full << cname
      end
    end
    
    return full
  end
  
  def self.index_by_path
    index = @by_path = {}
    @db.each do |cocktail|
      @by_path[cocktail["name_eng"].html_name] = cocktail
    end
  end
  
  def self.by_path path
    unless @by_path
      index_by_path
    end
    @by_path[path]
  end
end
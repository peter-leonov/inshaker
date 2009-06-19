#!/usr/bin/ruby
require 'barman'
require 'ya2yaml'
require 'lib/stuff'

class IngredientsConvertor < Barman::Processor
  
  module Config
    INGREDIENTS_DIR = Barman::BASE_DIR + "Ingredients.next/"
    HTDOCS_DIR      = Barman::HTDOCS_DIR

    GOODS_CSV           = INGREDIENTS_DIR + "Goods.csv"
    MERCH_ROOT          = HTDOCS_DIR + "i/merchandise/"
    INGREDS_ROOT        = MERCH_ROOT + "ingredients/"
    INGREDS_PRINT_ROOT  = INGREDS_ROOT + "print/"
    VOLUMES_ROOT        = MERCH_ROOT + "volumes/"
    BANNERS_ROOT        = MERCH_ROOT + "banners/"

    DB_JS_INGREDS        = HTDOCS_DIR + "db/ingredients.js"
    DB_JS_INGREDS_GROUPS = HTDOCS_DIR + "db/ingredients_groups.js"
    DB_JS_GOODS          = HTDOCS_DIR + "db/goods.js"
  end
  
  def initialize
    super
    @ingredients = []
    @ingredients_groups = []
    @goods = {}
    @opt = {:remove_destination => true}
  end
  
  def run
    # prepare_ingredients
    update_ingredients
    prepare_groups
    prepare_goods_yaml
  end
  
  def prepare_ingredients
    if File.exists?(Config::DB_JS_INGREDS)
      @ingredients_mtime = File.mtime(Config::DB_JS_INGREDS)
      @ingredients = JSON.parse(File.open(Config::DB_JS_INGREDS).read)
    else
      @ingredients_mtime = Time.at(0)
    end
  end
  
  def update_ingredients
    path = Config::INGREDIENTS_DIR
    Dir.new(path).each do |group|
      if !@excl.include?(group)
        Dir.new(path + group).each do |name|
          if !@excl.include?(name)
            @ingredient = {}
            @ingredient[:group] = group
            @ingredient[:name] = name
            @ingredients << @ingredient
          end
        end
      end
    end
  end
  
  def prepare_groups
    order = YAML::load(File.open("#{Config::INGREDIENTS_DIR}/groups.yaml"))
    order.each do |name, num|
      @ingredients_groups[num-1] = name
    end
  end
  
  def prepare_goods_yaml
    csv = CSV::parse(File.open(Config::GOODS_CSV).read)
    csv.shift # shifting through fields
    good = nil
    ingredient = ""
    i = 0
    csv.each do |line|
      if !line[0].nil? # new drink
        # break if (i+=1) > 5
        good = {}
        ingredient = line[0].to_s
        good[:brand] = line[1]
        good[:mark]  = line[2]
        good[:unit] = line[3]
        good[:volumes] = []
        puts "..#{ingredient}"
        @goods[ingredient] = [good]
      elsif line[0].nil? and line[1].nil? and line[2].nil? # volumes
        vol = line[4].nil? ? "" : line[4].zpt.to_f
        price = line[5].to_f
        avail = line[6] == "есть"
        good[:volumes] << [vol, price, avail]
      end
    end
    
    # p @goods
    
    @goods.each do |k, v|
      die "more than one element in #{k}" if v.length > 1
      next unless group_dir = group_dir_of(k)
      v = v[0]
      
      yaml = {}
      yaml["Марка"] = v[:mark].to_s if v[:mark]
      # yaml["Бренд"] = v[:brand].to_s if v[:brand]
      yaml["Единица"] = v[:unit].to_s if v[:unit]
      yaml["Тара"] = v[:volumes].map { |e| {"Объем" => e[0], "Цена" => e[1], "Наличие" => e[2] ? "есть" : "нет"} }
      
      File.write(Config::INGREDIENTS_DIR + group_dir + k + (v[:brand] ? "/#{v[:brand]}/" : "/") + "about.yaml", yaml.ya2yaml.gsub(/---\s+/,""))
      # about_path = Config::INGREDIENTS_DIR + group_dir_of(ingredient) + ingredient + (good[:brand] ? "/#{good[:brand]}/" : "/") + "about.txt"
      puts yaml.ya2yaml
    end
    
  end
  
private
  
  def group_dir_of(ingred)
    trans = ingred.trans
    # unicode with its crippled "й"
    @ingredients.each do |i|
      if i[:name].trans == trans
        return "#{i[:group]}/"
      end
    end
    nil
  end

end

IngredientsConvertor.new.run
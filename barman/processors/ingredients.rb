#!/usr/bin/ruby
require 'barman'

class IngredientsProcessor < Barman::Processor
  
  module Config
    INGREDIENTS_DIR = Barman::BASE_DIR + "Ingredients/"
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
  end
  
  def run
    prepare_ingredients
    prepare_groups
    prepare_goods
    
    flush_images
    flush_json
  end
  
  
  def prepare_ingredients
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
  
  def prepare_goods
    csv = CSV::parse(File.open(Config::GOODS_CSV).read)
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
        puts "..#{ingredient}"
        about_path = Config::INGREDIENTS_DIR + group_dir_of(ingredient) + ingredient + (good[:brand] ? "/#{good[:brand]}/" : "/") + "about.txt"
        good[:desc] = File.exists?(about_path) ? File.open(about_path).read : ""
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
        good[:unit]  = line[3]
        good[:volumes] = []
        goods_arr << good
      end
    end
  end
  
  def flush_json
    flush_json_object(@ingredients, Config::DB_JS_INGREDS)
    flush_json_object(@goods, Config::DB_JS_GOODS)
    flush_json_object(@ingredients_groups, Config::DB_JS_INGREDS_GROUPS)
  end
  
  def flush_images
    opt = {:remove_destination => true}
    @goods.each do |ingredient, arr|
      arr.each do |good|
        group_dir = "#{group_dir_of ingredient}"
        if good[:brand].empty? # unbranded
          unbranded_dir = Config::INGREDIENTS_DIR + group_dir + ingredient + "/"

          from_big   = unbranded_dir + "i_big.png"
          to_big   = Config::INGREDS_ROOT       + ingredient.trans + ".png"
          to_print = Config::INGREDS_PRINT_ROOT + ingredient.trans + ".jpg"

          FileUtils.cp_r(from_big, to_big, opt)         unless !File.exists?(from_big)
          flush_print_img(from_big, to_print, [60, 60]) unless !File.exists?(from_big)
          
          good[:volumes].each do |vol_arr|
            vol_name   = vol_arr[0].to_s.gsub(".", "_")
            from_big   = unbranded_dir + vol_name + "_big.png"
            from_small = unbranded_dir + vol_name + "_small.png"
            
            to_big   = Config::VOLUMES_ROOT + ingredient.trans + "_" + vol_name + "_big.png"
            to_small = Config::VOLUMES_ROOT + ingredient.trans + "_" + vol_name + "_small.png"
            
            FileUtils.cp_r(from_big, to_big, opt)     unless !File.exists?(from_big)
            FileUtils.cp_r(from_small, to_small, opt) unless !File.exists?(from_small)
          end
        else # brand-name goods
          from_dir = Config::INGREDIENTS_DIR + group_dir + ingredient + "/" + good[:brand] + "/"
          
          from_banner = from_dir + "banner.png"
          from_big    = from_dir + "i_big.png"
          
          to_big    = Config::INGREDS_ROOT       + ingredient.trans  + ".png"
          to_print  = Config::INGREDS_PRINT_ROOT + ingredient.trans  + ".jpg"  
          to_banner = Config::BANNERS_ROOT       + good[:mark].trans + ".png"
          
          FileUtils.cp_r(from_banner, to_banner, opt)   unless !File.exists?(from_banner)
          FileUtils.cp_r(from_big, to_big, opt)         unless !File.exists?(from_big)
          flush_print_img(from_big, to_print, [60, 60]) unless !File.exists?(from_big)
          
          good[:volumes].each do |vol_arr|
            vol_name   = vol_arr[0].to_s.gsub(".", "_")
            from_big   = from_dir + vol_name + "_big.png"
            from_small = from_dir + vol_name + "_small.png"
            
            to_big   = Config::VOLUMES_ROOT + good[:brand].trans + "_" + vol_name + "_big.png"
            to_small = Config::VOLUMES_ROOT + good[:brand].trans + "_" + vol_name + "_small.png"
            
            FileUtils.cp_r(from_big, to_big, opt)     unless !File.exists?(from_big)
            FileUtils.cp_r(from_small, to_small, opt) unless !File.exists?(from_small)
          end
        end
      end
    end
  end
  
private
  
  def group_dir_of(ingred)
    res = ""
    # unicode with its crippled "й"
    @ingredients.each { |i| if i[:name].trans == ingred.trans then res = "#{i[:group]}/"; break end }
    res
  end

end

IngredientsProcessor.new.run
#!/usr/bin/ruby
require 'barman'

class IngredientsProcessor < Barman::Processor
  
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
  end
  
  def run
    prepare_dirs
    prepare_ingredients
    prepare_groups
    
    update_ingredients
    
    flush_json if @errors_count == 0
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::MERCH_ROOT, Config::INGREDS_ROOT, Config::VOLUMES_ROOT, Config::BANNERS_ROOT]
  end
  
  def prepare_groups
    @ingredients_groups = YAML::load(File.open("#{Config::INGREDIENTS_DIR}/groups.yaml"))
  end
  
  def flush_json
    flush_json_object(@ingredients, Config::DB_JS_INGREDS)
    flush_json_object(@goods, Config::DB_JS_GOODS)
    flush_json_object(@ingredients_groups, Config::DB_JS_INGREDS_GROUPS)
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
    Dir.new(Config::INGREDIENTS_DIR).each_dir do |group_dir|
      say group_dir.name
      indent do
      group_dir.each_dir do |ingredient_dir|
        say ingredient_dir.name
        ingredient = process_ingredient(ingredient_dir, ingredient_dir.name)
        unless ingredient
          indent do
          ingredient_dir.each_dir do |brand_dir|
            if ingredient = process_ingredient(brand_dir, ingredient_dir.name, brand_dir.name)
              say brand_dir.name
              break
            end
          end
          end # indent
        end
        
        unless ingredient
          warning "не нашел описания для ингредиента «#{ingredient_dir.name}» в группе «#{group_dir.name}»"
          next
        end
        
        @goods[ingredient_dir.name] = ingredient
        
      end
      end # indent
    end
  end
  
  def process_ingredient dir, name, brand=nil
    return unless File.exists? dir.path + "/about.yaml"
    about = YAML::load(File.open(dir.path + "/about.yaml"))
    
    ingredient = {}
    
    if about["Единица"]
      ingredient[:unit] = about["Единица"]
    else
      error "не указана единица"
    end
    
    if brand
      ingredient[:brand] = brand
      
      if about["Марка"]
        ingredient[:mark] = about["Марка"]
      else
        error "не указана марка (бренд «#{brand}»)"
      end
    end
    
    if about["Тара"] and about["Тара"].length > 0
      ingredient[:volumes] = volumes = []
      about["Тара"].each do |v|
        volumes << [v["Объем"], v["Цена"], v["Наличие"] == "есть"]
      end
    else
      error "тара не указана"
    end
    
    
    big = dir.path + "/i_big.png"
    if File.exists?(big)
      flush_pngm_img(big, Config::INGREDS_ROOT + name.trans + ".png")
    else
      error "нет большой картинки (файл #{big})"
    end
    # flush_print_img(from_big, to_print, [60, 60]) unless !File.exists?(from_big)
    
    
    
    return ingredient
  end
  
  def update_images
    opt = {:remove_destination => true}
    @goods.each do |ingredient, arr|
      arr.each do |good|
        group_dir = "#{group_dir_of ingredient}"
        if good[:brand].empty? # unbranded
          unbranded_dir = Config::INGREDIENTS_DIR + group_dir + ingredient + "/"
          
          from_big   = unbranded_dir + "i_big.png"
          to_big   = Config::INGREDS_ROOT       + ingredient.trans + ".png"
          # to_print = Config::INGREDS_PRINT_ROOT + ingredient.trans + ".jpg"
          
          if File.exists?(from_big)
            flush_pngm_img(from_big, to_big)
          else
            warn "Can't find big image at #{from_big}"
          end
          # flush_print_img(from_big, to_print, [60, 60]) unless !File.exists?(from_big)
          
          good[:volumes].each do |vol_arr|
            vol_name   = vol_arr[0].to_s.gsub(".", "_")
            from_big   = unbranded_dir + vol_name + "_big.png"
            from_small = unbranded_dir + vol_name + "_small.png"
            
            to_big   = Config::VOLUMES_ROOT + ingredient.trans + "_" + vol_name + "_big.png"
            to_small = Config::VOLUMES_ROOT + ingredient.trans + "_" + vol_name + "_small.png"
            
            if File.exists?(from_big)
              FileUtils.cp_r(from_big, to_big, opt)
            else
              warn %Q{#{ingredient} hasn't big volume (#{vol_name}) image at "#{from_big}"}
            end
            
            if File.exists?(from_small)
              FileUtils.cp_r(from_small, to_small, opt)
            else
              # warn %Q{#{ingredient} hasn't small volume (#{vol_name}) image at "#{from_small}"}
            end
          end
        else # brand-name goods
          from_dir = Config::INGREDIENTS_DIR + group_dir + ingredient + "/" + good[:brand] + "/"
          
          from_banner = from_dir + "banner.png"
          from_big    = from_dir + "i_big.png"
          
          to_big    = Config::INGREDS_ROOT       + ingredient.trans  + ".png"
          to_print  = Config::INGREDS_PRINT_ROOT + ingredient.trans  + ".jpg"  
          to_banner = Config::BANNERS_ROOT       + good[:mark].trans + ".png"
          
          FileUtils.cp_r(from_banner, to_banner, opt)   unless !File.exists?(from_banner)
          
          if File.exists?(from_big)
            flush_pngm_img(from_big, to_big)
          else
            warn "Can't find big image at #{from_big}"
          end
          
          # flush_print_img(from_big, to_print, [60, 60]) unless !File.exists?(from_big)
          
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
  
end

IngredientsProcessor.new.run
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
    
    update_goods
    
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
  
  
  def update_goods
    Dir.new(Config::INGREDIENTS_DIR).each_dir do |group_dir|
      say group_dir.name
      indent do
      group_dir.each_dir do |good_dir|
        good = process_good(good_dir, good_dir.name)
        unless good
          say good_dir.name
          indent do
          good_dir.each_dir do |brand_dir|
            if good = process_good(brand_dir, good_dir.name, brand_dir.name)
              break
            end
          end
          unless good
            # warning "не нашел описания для ингредиента «#{good_dir.name}» в группе «#{group_dir.name}»"
            warning "не нашел описания"
            next
          end
          end # indent
        end
        
        @goods[good_dir.name] = good
      end
      end # indent
    end
  end
  
  def process_good dir, name, brand=nil
    return unless File.exists? dir.path + "/about.yaml"
    say dir.name
    good = {}
    indent do
    
    name_trans = name.trans
    opt = {:remove_destination => true}
    
    img = dir.path + "/i_big.png"
    if File.exists?(img)
      flush_pngm_img(img, Config::INGREDS_ROOT + name.trans + ".png")
    else
      error "нет большой картинки (файл #{img})"
    end
    
    
    about = YAML::load(File.open(dir.path + "/about.yaml"))
    
    if about["Единица"]
      good[:unit] = about["Единица"]
    else
      error "не указана единица"
    end
    
    if brand
      good[:brand] = brand
      
      if about["Марка"]
        good[:mark] = about["Марка"]
        
        banner = dir.path + "/banner.png"
        if File.exists?(banner)
          FileUtils.cp_r(banner, Config::BANNERS_ROOT + about["Марка"].trans + ".png", opt)
        else
          error "нет картинки банера (banner.png)"
        end
        
      else
        error "не указана марка (бренд «#{brand}»)"
      end
    end
    
    if about["Тара"] and about["Тара"].length > 0
      good[:volumes] = volumes = []
      about["Тара"].each do |v|
        volumes << [v["Объем"], v["Цена"], v["Наличие"] == "есть"]
        
        vol_name = v["Объем"].to_s.gsub(".", "_")
        img = dir.path + "/" + vol_name + "_big.png"
        
        if File.exists?(img)
          FileUtils.cp_r(img, Config::VOLUMES_ROOT + name_trans + "_" + vol_name + "_big.png", opt)
        else
          error "не могу найти каритку для объема «#{v["Объем"]}» (#{vol_name}_big.png)"
        end
        
      end
    else
      error "тара не указана"
    end
    
    end # indent
    return good
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
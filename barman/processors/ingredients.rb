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
    prepare_dirs
    # prepare_ingredients
    # prepare_groups
    
    update_goods
    
    if @errors_count == 0
      done "критических ошибок не было"
      flush_json
    end
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::MERCH_ROOT, Config::INGREDS_ROOT, Config::VOLUMES_ROOT, Config::BANNERS_ROOT]
  end
  
  def prepare_groups
    @ingredients_groups = YAML::load(File.open("#{Config::INGREDIENTS_DIR}/groups.yaml"))
  end
  
  def flush_json
    say "сохраняю данные об ингредиентах"
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
            break if good = process_good(brand_dir, good_dir.name, brand_dir.name)
          end
          unless good
            warning "не нашел описания"
          end
          end # indent
        end
        
        if good
          @goods[good_dir.name] ? @goods[good_dir.name] << good : @goods[good_dir.name] = [good]
          @ingredients << {"group" => group_dir.name, "name" => good_dir.name}
          # say ({"group" => group_dir.name, "name" => good_dir.name}).to_json
        end
      end
      end # indent
    end
  end
  
  def process_good dir, name, brand=nil
    about = dir.path + "/about.yaml"
    return unless File.exists?(about)
    say dir.name
    good = {}
    indent do
    about = YAML::load(File.open(about))
    
    name_trans = nil
    opt = {:remove_destination => true}
    
    img = dir.path + "/i_big.png"
    if File.exists?(img)
      flush_pngm_img(img, Config::INGREDS_ROOT + name.trans + ".png")
    else
      error "нет большой картинки (файл #{img})"
    end
    
    legend = dir.path + "/about.txt"
    if File.exists?(legend)
      good[:desc] = File.read(legend)
    else
      warning "нет файла с легендой ингредиента (about.txt)"
    end
    
    
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
      name_trans = brand.trans
    else
      name_trans = name.trans
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
          error "не могу найти картинку для объема «#{v["Объем"]}» (#{vol_name}_big.png)"
        end
        
      end
    else
      error "тара не указана"
    end
    end # indent
    return good
  end
  
end

IngredientsProcessor.new.run
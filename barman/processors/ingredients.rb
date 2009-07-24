#!/opt/ruby1.9/bin/ruby -W0 -E utf-8:utf-8
# encoding: utf-8
require 'barman'
require 'uri'
require 'optparse'

class IngredientsProcessor < Barman::Processor
  
  module Config
    INGREDIENTS_DIR      = Barman::BASE_DIR + "Ingredients/"
    HTDOCS_DIR           = Barman::HTDOCS_DIR

    MERCH_ROOT           = HTDOCS_DIR + "i/merchandise/"
    INGREDS_ROOT         = MERCH_ROOT + "ingredients/"
    INGREDS_PRINT_ROOT   = INGREDS_ROOT + "print/"
    VOLUMES_ROOT         = MERCH_ROOT + "volumes/"
    BANNERS_ROOT         = MERCH_ROOT + "banners/"
    
    HTDOCS_ROOT          = HTDOCS_DIR + "ingredients/"
    NOSCRIPT_LINKS       = HTDOCS_ROOT + "links.html"

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
    
    @options = {}
    OptionParser.new do |opts|
      opts.banner = "Usage: ingredients.rb [options]"
      
      opts.on("-f", "--force", "Force update without mtime based cache") do |v|
        @options[:force] = v
      end
    end.parse!
    
    prepare_dirs
    prepare_goods
    
    update_groups
    update_goods
    
    if summary
      flush_links
      flush_json
    end
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::HTDOCS_ROOT, Config::MERCH_ROOT, Config::INGREDS_ROOT, Config::VOLUMES_ROOT, Config::BANNERS_ROOT]
  end
  
  def update_groups
    @ingredients_groups = YAML::load(File.open("#{Config::INGREDIENTS_DIR}/groups.yaml"))
  end
  
  def flush_json
    say "сохраняю данные об ингредиентах"
    flush_json_object(@ingredients, Config::DB_JS_INGREDS)
    flush_json_object(@goods, Config::DB_JS_GOODS)
    flush_json_object(@ingredients_groups, Config::DB_JS_INGREDS_GROUPS)
  end
  
  def flush_links
    File.open(Config::NOSCRIPT_LINKS, "w+") do |links|
      links.puts "<ul>"
      @goods.each do |name, entity|
        links.puts %Q{<li>#{name} — #{entity["group"]}</li>}
      end
      links.puts "</ul>"
    end
  end
  
  def prepare_goods
    if File.exists?(Config::DB_JS_GOODS) && !@options[:force]
      @goods_mtime = File.mtime(Config::DB_JS_GOODS)
      @goods = JSON.parse(File.read(Config::DB_JS_GOODS))
    else
      @goods_mtime = Time.at(0)
    end
  end
  
  def update_goods
    say "обновляю ингредиенты"
    indent do
    done = 0
    Dir.new(Config::INGREDIENTS_DIR).each_dir do |group_dir|
      group_dir.each_dir do |good_dir|
        good = process_good(good_dir, group_dir.name, good_dir.name)
        unless good
          good_dir.each_dir do |brand_dir|
            break if good = process_good(brand_dir, group_dir.name, good_dir.name, brand_dir.name)
          end
          unless good
            warning "#{group_dir.name}: #{good_dir.name} не нашел описания"
          end
        end
        names = read_names(good_dir, good_dir.name)
        
        if good
          @ingredients << {"group" => group_dir.name, "name" => good_dir.name}
          if good != true
            done += 1
            good["group"] = group_dir.name
            if names
              good["names"] = names
            end
            @goods[good_dir.name] = good
          end
        end
      end
    end
    say "#{done.items("обновлен", "обновлено", "обновлено")} #{done} #{done.items("ингредиент", "ингредиента", "ингредиентов")}"
    end # indent
  end
  
  def read_names dir, name
    fname = dir.path + "/names.yaml"
    if File.exists?(fname) && File.mtime(fname) >= @goods_mtime
      say "обновляю псевдонимы для «#{name}»"
      YAML::load(File.open(fname))
    else
      nil
    end
  end
  
  def process_good dir, group, name, brand=nil
    about = dir.path + "/about.yaml"
    return unless File.exists?(about)
    return true if @goods[name] && File.mtime(dir.path) <= @goods_mtime
    
    say brand ? "#{group}: #{name} (#{brand})" : "#{group}: #{name}"
    
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

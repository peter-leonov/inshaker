#!/opt/ruby1.9/bin/ruby -W0
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
  
  def job_name
    "смешивалку ингредиентов"
  end
  
  def job
    @options = {:force => true}
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
    
    unless errors?
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
      @goods.keys.sort.each do |name|
        entity = @goods[name]
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
        mtime = good_dir.deep_mtime
        if mtime > @goods_mtime
          if good = find_good(good_dir, group_dir)
            done += 1
            good["group"] = group_dir.name
            @goods[good_dir.name] = good
            
            if names = read_names(good_dir)
              good["names"] = names
            else
              good.delete("names")
            end
          else
            warning "#{group_dir.name}: #{good_dir.name} не нашел описания"
          end
        end
        @ingredients << {"group" => group_dir.name, "name" => good_dir.name}
      end
    end
    say "#{done.items("обновлен", "обновлено", "обновлено")} #{done} #{done.items("ингредиент", "ингредиента", "ингредиентов")}"
    end # indent
  end
  
  def find_good good_dir, group_dir
    errors = []
    good = process_good(good_dir, group_dir.name, good_dir.name)
    if good
      found = true
    end
    
    good_dir.each_dir do |brand_dir|
      if found
        errors << [group_dir, good_dir, brand_dir]
      else
        if good = process_good(brand_dir, group_dir.name, good_dir.name, brand_dir.name)
          found = true
        else
          errors << [group_dir, good_dir, brand_dir]
        end
      end
    end
    errors.each do |arr|
      error "непонятная папочка #{arr[0].name}/#{arr[1].name}/#{arr[2].name}"
    end
    good
  end
  
  def read_names dir
    fname = dir.path + "/names.yaml"
    if File.exists?(fname)
      say "обновляю псевдонимы"
      YAML::load(File.open(fname))
    else
      nil
    end
  end
  
  def process_good dir, group, name, brand=nil
    about = dir.path + "/about.yaml"
    return unless File.exists?(about)
    # return true if @goods[name] && File.mtime(dir.path) <= @goods_mtime
    
    say brand ? "#{group}: #{name} (#{brand})" : "#{group}: #{name}"
    
    good = {}
    indent do
    about = YAML::load(File.open(about))
    
    name_trans = nil
    opt = {:remove_destination => true}
    
    img = dir.path + "/i_big.png"
    if File.exists?(img)
      # File.cp_if_different(img, Config::INGREDS_ROOT + name.trans + ".png")
      flush_masked_optimized_pngm_img(Config::INGREDIENTS_DIR + "mask.png", img, Config::INGREDS_ROOT + name.trans + ".png") 
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
          File.cp_if_different(banner, Config::BANNERS_ROOT + about["Марка"].trans + ".png")
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
          File.cp_if_different(img, Config::VOLUMES_ROOT + name_trans + "_" + vol_name + "_big.png")
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

exit IngredientsProcessor.new.run
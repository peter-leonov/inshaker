#!/usr/bin/ruby
require 'barman'

class GiftsProcessor < Barman::Processor
  
  module Config
    GIFTS_DIR  = Barman::BASE_DIR + "Gifts/"
    HTDOCS_DIR = Barman::HTDOCS_DIR
    
    IMAGES_DIR = HTDOCS_DIR + "i/gift/"
    
    DB_JS = HTDOCS_DIR + "db/gifts.js"
  end
  
  def job
    @gifts = []
    @gift  = {}
    prepare_gifts
    flush_images
    flush_json 
  end
  
  def prepare_gifts
    root_dir = Dir.new(Config::GIFTS_DIR)
    root_dir.each do |city_dir|
      city_path = root_dir.path + city_dir
      if File.ftype(city_path) == "directory" and !@excl.include?(city_dir)
        puts city_dir
        gifts_dir = Dir.new(city_path)
        orders = load_yaml(city_path + "/gifts.yaml") 
        gifts_dir.each do |gift_dir|
          gift_path = gifts_dir.path + "/" + gift_dir
          if File.ftype(gift_path) == "directory" and !@excl.include?(gift_dir)
            puts ".." + gift_dir
            
            @gift = {}
            yaml = load_yaml(gift_path + "/about.txt")
            @gift[:city] = city_dir
            @gift[:name] = gift_dir
            @gift[:name_full] = yaml["Полное название"] 
            @gift[:desc] = yaml["Описание"].split("\n")
            @gift[:places] = yaml["Где купить"]
            @gift[:order] = orders[@gift[:name].yi]
            detect_big_images(gift_path)
            @gifts << @gift
          end
        end
      end
    end
  end
  
  def load_yaml filename
    YAML::load(File.open(filename))
  end
  
  def detect_big_images gift_path
    @gift[:big_images] = []
    counter = 1
    while File.exists?(gift_path + "/big-#{counter}.jpg")
      @gift[:big_images] << "/i/gift/" + @gift[:city].trans.html_name + "/" + @gift[:name].trans.html_name + "-big-#{counter}.jpg"
      counter += 1
    end
  end
  
  
  def flush_images
    @gifts.each do |gift|
      gift_path = Config::GIFTS_DIR + gift[:city] + "/" + gift[:name] + "/"
        out_images_path = Config::IMAGES_DIR + gift[:city].trans.html_name
        if !File.exists? out_images_path then FileUtils.mkdir_p out_images_path end
        
        if File.exists?(gift_path + "mini.jpg")
          FileUtils.cp_r(gift_path + "mini.jpg", out_images_path + "/" + gift[:name].trans.html_name + "-mini.jpg", @mv_opt)
        end
        
        if File.exists?(gift_path + "price.png")
          FileUtils.cp_r(gift_path + "price.png", out_images_path + "/" + gift[:name].trans.html_name + "-price.png", @mv_opt)
        end
        
        counter = 1
        while File.exists?(gift_path + "big-#{counter}.jpg")
          FileUtils.cp_r(gift_path + "big-#{counter}.jpg", out_images_path + "/" + gift[:name].trans.html_name + "-big-#{counter}.jpg", @mv_opt)
          counter +=1
        end
    end
   
  end
  
  def flush_json
    flush_json_object(@gifts, Config::DB_JS)
  end
  
end

exit GiftsProcessor.new.run
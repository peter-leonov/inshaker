#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'

class GiftsProcessor < Barman::Processor
  
  module Config
    GIFTS_DIR  = Barman::BASE_DIR + "Gifts/"
    HTDOCS_DIR = Barman::HTDOCS_DIR
    
    IMAGES_DIR = HTDOCS_DIR + "i/gift/"
    
    DB_JS = HTDOCS_DIR + "db/gifts.js"
  end
  
  def job_name
    "смешивалку подарков"
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
    root_dir.each_dir do |city_dir|
      # city_path = root_dir.path + city_dir
      say city_dir.name
      indent do
      city_gifts = []
      orders = load_yaml(city_dir.path + "/gifts.yaml") 
      city_dir.each_dir do |gift_dir|
        indent do
        say gift_dir.name
        
        @gift = {}
        yaml = load_yaml(gift_dir.path + "/about.txt")
        @gift[:city] = city_dir.name
        @gift[:name] = gift_dir.name
        @gift[:name_full] = yaml["Полное название"] 
        @gift[:desc] = yaml["Описание"].split("\n")
        @gift[:places] = yaml["Где купить"]
        detect_big_images(gift_dir)
        city_gifts << @gift
        end # indent
      end
      @gifts += city_gifts.sort { |a, b| (orders.index(a[:name]) || 100) - (orders.index(b[:name]) || 100) }
      end # indent
    end
  end
  
  def load_yaml filename
    YAML::load(File.open(filename))
  end
  
  def detect_big_images gift_dir
    @gift[:big_images] = []
    counter = 1
    while File.exists?(gift_dir.path + "/big-#{counter}.jpg")
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
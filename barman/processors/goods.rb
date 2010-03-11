#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'

class GoodsProcessor < Barman::Processor
  
  module Config
    GIFTS_DIR  = Barman::BASE_DIR + "Goods/"
    HTDOCS_DIR = Barman::HTDOCS_DIR
    
    IMAGES_DIR = HTDOCS_DIR + "i/good/"
    
    DB_JS = HTDOCS_DIR + "db/goods.js"
  end
  
  def job_name
    "смешивалку покупок"
  end
  
  def job
    @goods = []
    @good  = {}
    prepare_goods
    flush_images
    flush_json 
  end
  
  def prepare_goods
    root_dir = Dir.new(Config::GIFTS_DIR)
    root_dir.each_dir do |city_dir|
      # city_path = root_dir.path + city_dir
      say city_dir.name
      indent do
      city_goods = []
      # orders = load_yaml(city_dir.path + "/goods.yaml") 
      city_dir.each_dir do |good_dir|
        indent do
        say good_dir.name
        
        @good = {}
        yaml = load_yaml(good_dir.path + "/about.txt")
        @good[:city] = city_dir.name
        @good[:name] = good_dir.name
        @good[:name_full] = yaml["Полное название"] 
        @good[:desc] = yaml["Описание"].split("\n")
        @good[:places] = yaml["Где купить"]
        detect_big_images(good_dir)
        city_goods << @good
        end # indent
      end
      @goods += city_goods#.sort { |a, b| (orders.index(a[:name]) || 100) - (orders.index(b[:name]) || 100) }
      end # indent
    end
  end
  
  def load_yaml filename
    YAML::load(File.open(filename))
  end
  
  def detect_big_images good_dir
    @good[:big_images] = []
    counter = 1
    while File.exists?(good_dir.path + "/big-#{counter}.jpg")
      @good[:big_images] << "/i/good/" + @good[:city].trans.html_name + "/" + @good[:name].trans.html_name + "-big-#{counter}.jpg"
      counter += 1
    end
  end
  
  
  def flush_images
    @goods.each do |good|
      good_path = Config::GIFTS_DIR + good[:city] + "/" + good[:name] + "/"
        out_images_path = Config::IMAGES_DIR + good[:city].trans.html_name
        if !File.exists? out_images_path then FileUtils.mkdir_p out_images_path end
        
        if File.exists?(good_path + "mini.jpg")
          FileUtils.cp_r(good_path + "mini.jpg", out_images_path + "/" + good[:name].trans.html_name + "-mini.jpg", @mv_opt)
        end
        
        if File.exists?(good_path + "price.png")
          FileUtils.cp_r(good_path + "price.png", out_images_path + "/" + good[:name].trans.html_name + "-price.png", @mv_opt)
        end
        
        counter = 1
        while File.exists?(good_path + "big-#{counter}.jpg")
          FileUtils.cp_r(good_path + "big-#{counter}.jpg", out_images_path + "/" + good[:name].trans.html_name + "-big-#{counter}.jpg", @mv_opt)
          counter +=1
        end
    end
   
  end
  
  def flush_json
    flush_json_object(@goods, Config::DB_JS)
  end
  
end

exit GoodsProcessor.new.run
#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'

class GoodsProcessor < Barman::Processor
  
  module Config
    GOODS_DIR  = Barman::BASE_DIR + "Goods/"
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
    process_goods
    flush_json
  end
  
  def process_goods
    root_dir = Dir.new(Config::GOODS_DIR)
    
    order = load_yaml(root_dir.path + "/order.yaml")
    
    root_dir.each_dir do |good_dir|
      say good_dir.name
      indent do
      @good = {}
      yaml = load_yaml(good_dir.path + "/about.yaml")
      @good[:name] = good_dir.name
      @good[:name_full] = yaml["Полное название"] 
      @good[:desc] = yaml["Описание"].split("\n")
      @good["places"] = yaml["Где купить"]
      
      count = @good["images"] = update_images(good_dir)
      if count == 0
        error "не нашел ни одной большой картинки"
      else
        say "нашел #{count} #{count.plural("большую картинку", "большие картинки", "больших картинок")}"
      end
      
      @goods << @good
      end # indent
    end
    
    @goods = @goods.sort { |a, b| (order.index(a[:name]) || 100) - (order.index(b[:name]) || 100) }
  end
  
  def load_yaml filename
    YAML::load(File.open(filename))
  end
  
  def update_images good_dir
    @good[:big_images] = []
    counter = 0
    while File.exists?(good_dir.path + "/big-#{counter+1}.jpg")
      # @good[:big_images] << "/i/good/" + @good[:city].trans.html_name + "/" + @good[:name].trans.html_name + "-big-#{counter}.jpg"
      counter += 1
    end
    counter
  end
  
  
  def flush_json
    flush_json_object(@goods, Config::DB_JS)
  end
  
end

exit GoodsProcessor.new.run
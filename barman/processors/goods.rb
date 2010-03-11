#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'

class GoodsProcessor < Barman::Processor
  
  module Config
    GOODS_DIR   = Barman::BASE_DIR + "Goods/"
    HTDOCS_DIR  = Barman::HTDOCS_DIR
    
    HTDOCS_ROOT = HTDOCS_DIR + "good/"
    
    DB_JS = HTDOCS_DIR + "db/goods.js"
  end
  
  def job_name
    "смешивалку покупок"
  end
  
  def job
    @goods = []
    @good  = {}
    process_goods
    unless errors?
      flush_json
    end
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::HTDOCS_ROOT]
  end
  
  def process_goods
    root_dir = Dir.new(Config::GOODS_DIR)
    root_dir.each_dir do |good_dir|
      say good_dir.name
      indent do
      
      @good = {}
      yaml = load_yaml(good_dir.path + "/about.yaml")
      
      @good["name"] = good_dir.name
      @good["name_eng"] = yaml["По-английски"]
      path = @good["path"] = @good["name_eng"].dirify
      
      @good["name_full"] = yaml["Полное название"]
      @good["desc"] = yaml["Описание"].split("\n")
      @good["places"] = yaml["Где купить"]
      
      full_path = Config::HTDOCS_ROOT + '/' + path
      FileUtils.mkdir_p [full_path]
      dst_dir = Dir.new(full_path)
      
      count = @good["images"] = update_images(good_dir, dst_dir)
      if count == 0
        error "не нашел ни одной большой картинки (начал искать с big-1.jpg)"
      else
        say "нашел #{count} #{count.plural("большую картинку", "большие картинки", "больших картинок")}"
      end
      
      @goods << @good
      end # indent
    end
    
    order = load_yaml(root_dir.path + "/order.yaml")
    @goods = @goods.sort { |a, b| (order.index(a[:name]) || 100) - (order.index(b[:name]) || 100) }
  end
  
  def update_images src, dst
    counter = 0
    while File.exists?(src.path + "/big-#{counter+1}.jpg")
      cp_if_different src.path + "/big-#{counter+1}.jpg", dst.path + "/big-#{counter+1}.jpg"
      counter += 1
    end
    counter
  end
  
  
  def flush_json
    @goods.each do |good|
      # YAGNI
      good.delete("desc")
      good.delete("places")
      good.delete("name_full")
      good.delete("images")
    end
    
    flush_json_object(@goods, Config::DB_JS)
  end
  
end

exit GoodsProcessor.new.run
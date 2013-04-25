#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

require "inshaker"
require "entities/ingredient"

class GoodsProcessor < Inshaker::Processor
  
  module Config
    GOODS_DIR          = Inshaker::BASE_DIR + "Goods/"
    ERB                = Inshaker::TEMPLATES_DIR + "good.rhtml"
    
    HT_ROOT            = Inshaker::HTDOCS_DIR + "good/"
    NOSCRIPT_LINKS     = HT_ROOT + "links.html"
    
    DB_JS              = Inshaker::HTDOCS_DIR + "db/goods/goods.json"
  end
  
  def initialize
    super
    @all_ingredients = {}
  end
  
  def job_name
    "смешивалку покупок"
  end
  
  def job
    @options = {}
    OptionParser.new do |opts|
      opts.banner = "Usage: ingredients.rb [options]"
      
      opts.on("-t", "--text", "Text updates only") do |v|
        @options[:text] = v
      end
    end.parse!
    
    @goods = []
    
    sync_base "Goods"
    fix_base "Goods"
    
    prepare_dirs
    prepare_renderer
    prepare_ingredients
    
    process_goods
    
    unless errors?
      cleanup_deleted
      flush_links
      flush_json
    end
  end
  
  def prepare_ingredients
    if File.exists?(Ingredient::Config::DB_JS)
      load_json(Ingredient::Config::DB_JS).each do |ingred|
        @all_ingredients[ingred["name"]] = ingred
      end
    end
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::HT_ROOT]
  end
  
  def prepare_renderer
    @renderer = ERB.new(File.read(Config::ERB))
  end
  
  def process_goods
    root_dir = Dir.new(Config::GOODS_DIR)
    root_dir.each_dir do |good_dir|
      say good_dir.name
      indent do
      
      good = {}
      yaml = load_yaml(good_dir.path + "/about.yaml")
      
      good["name"] = good_dir.name
      good["name_eng"] = yaml["По-английски"]
      path = good["path"] = good["name_eng"].dirify
      
      if yaml["Что продается"]
        for_sale = good["sell"] = []
        yaml["Что продается"].each do |v|
          if @all_ingredients[v]
            for_sale << v
          else
            error %Q{нет такого ингредиента или штучки "#{v}"}
          end
        end
        say "продается #{for_sale.length} #{for_sale.length.plural("всячина", "всячины", "всячин")}"
      end
      
      if yaml["Цена"]
        price = good["price"] = {}
        
        if yaml["Цена"]["Числом"]
          price["number"] = yaml["Цена"]["Числом"].to_i
        else
          error "нету цены числом"
        end
        
        if yaml["Цена"]["Прописью"]
          price["text"] = yaml["Цена"]["Прописью"]
        else
          error "нету цены прописью"
        end
        
        if yaml["Цена"]["Фраза"]
          price["phrase"] = yaml["Цена"]["Фраза"]
        else
          error "нету фразы для цены"
        end
        
        if price["text"] && price["number"] && price["text"].to_s.gsub(/\D/, '').to_i != price["number"]
          warning "цена прописью (#{price["text"]}) не похожа на цену числом (#{price["number"]})"
        end
      end
      
      good["name_full"] = yaml["Полное название"]
      good["desc"] = yaml["Описание"].to_s.gsub(/\n/, "<br/><br/>")
      good["places"] = yaml["Где купить"] || []
      
      all_places = []
      good["places"].each do |types|
        types.each do |name, list|
          unless list
            error "нет описания для типа «#{name}»"
            next
          end
          places = []
          all_places << {"name" => name, "places" => places}
          list.each do |place|
            place.each do |name, desc|
              unless desc
                error "нет описания для места «#{name}»"
                next
              end
              places << {
                "name" => name,
                "address" => desc["Адрес"],
                "link" => desc["Ссылка"],
                "hours" => desc["Часы работы"],
                "phone" => desc["Телефон"]
              }
            end
          end
        end
      end
      good["places"] = all_places
      
      full_path = Config::HT_ROOT + '/' + path
      FileUtils.mkdir_p [full_path]
      dst_dir = Dir.new(full_path)
      
      count = good["promos"] = update_images(good_dir, dst_dir)
      if count == 0
        error "не нашел ни одной большой картинки (начал искать с big-1.jpg)"
      else
        say "нашел #{count} #{count.plural("большую картинку", "большие картинки", "больших картинок")}"
      end
      
      File.write("#{dst_dir.path}/index.html", @renderer.result(GoodTemplate.new(good).get_binding))
      
      @goods << good
      end # indent
    end
    
    order = load_yaml(root_dir.path + "/order.yaml")
    @goods = @goods.sort { |a, b| (order.index(a["name"]) || 100) - (order.index(b["name"]) || 100) }
  end
  
  def update_images src, dst
    name = "mini.png"
    if File.exists? src.path + '/' + name
      flush_masked_optimized(Config::GOODS_DIR + "/mask.png", src.path + '/' + name, dst.path + "/" + name) unless @options[:text]
    else
      error "нету маленькой картинки"
    end
    
    counter = 0
    while 1
      name = "promo-#{counter+1}.jpg"
      break unless File.exists? src.path + '/' + name
      cp_if_different src.path + '/' + name, dst.path + "/" + name
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
      good.delete("price")
    end
    
    flush_json_object(@goods, Config::DB_JS)
  end
  
  def flush_links
    File.open(Config::NOSCRIPT_LINKS, "w+") do |links|
      links.puts "<ul>"
      @goods.each do |good|
        links.puts %Q{<li><a href="/good/#{good["path"]}/">#{good["name"]}</a></li>}
      end
      links.puts "</ul>"
    end
  end
  
  def cleanup_deleted
    say "ищу удаленные"
    indent do
    index = {}
    @goods.each do |entity|
      index[entity["path"]] = entity
    end
    
    Dir.new(Config::HT_ROOT).each_dir do |dir|
      unless index[dir.name]
        say "удаляю #{dir.name}"
        FileUtils.rmtree(dir.path)
      end
    end
    end # indent
  end
end

class GoodTemplate
  def initialize *hashes
    hashes.each do |hash|
      hash.each do |k, v|
        instance_variable_set("@#{k}", v)
      end
    end
  end
  
  def get_binding
    binding
  end
end


exit GoodsProcessor.new.run
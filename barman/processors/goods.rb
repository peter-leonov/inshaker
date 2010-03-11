#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'

class GoodsProcessor < Barman::Processor
  
  module Config
    GOODS_DIR   = Barman::BASE_DIR + "Goods/"
    HTDOCS_DIR  = Barman::HTDOCS_DIR
    ERB         = Barman::TEMPLATES_DIR + "good.rhtml"
    
    HTDOCS_ROOT    = HTDOCS_DIR + "good/"
    NOSCRIPT_LINKS = HTDOCS_ROOT + "links.html"
    
    DB_JS = HTDOCS_DIR + "db/goods.js"
  end
  
  def job_name
    "смешивалку покупок"
  end
  
  def job
    @goods = []
    
    prepare_dirs
    prepare_renderer
    
    process_goods
    
    unless errors?
      flush_links
      flush_json
    end
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::HTDOCS_ROOT]
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
      
      full_path = Config::HTDOCS_ROOT + '/' + path
      FileUtils.mkdir_p [full_path]
      dst_dir = Dir.new(full_path)
      
      count = good["images"] = update_images(good_dir, dst_dir)
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
    counter = 0
    while 1
      name = "big-#{counter+1}.jpg"
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
      good.delete("images")
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
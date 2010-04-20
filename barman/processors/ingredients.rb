#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require "barman"

class IngredientsProcessor < Barman::Processor
  
  module Config
    BASE_DIR       = Barman::BASE_DIR + "Ingredients/"
    
    HT_ROOT        = Barman::HTDOCS_DIR + "ingredient/"
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    
    DB_JS          = Barman::HTDOCS_DIR + "db/ingredients.js"
    DB_JS_GROUPS   = Barman::HTDOCS_DIR + "db/ingredients_groups.js"
    DB_JS_MARKS    = Barman::HTDOCS_DIR + "db/marks.js"
  end
  
  def initialize
    super
    @local_properties = []
    @entities = []
    @ingredients_groups = []
    @marks = {}
  end
  
  def job_name
    "смешивалку ингредиентов"
  end
  
  def pre_job
    @options[:force] = true
    OptionParser.new do |opts|
      opts.banner = "Usage: ingredients.rb [options]"
      
      opts.on("-f", "--force", "Force update without mtime based cache") do |v|
        @options[:force] = v
      end
      
      opts.on("-t", "--text", "Text updates only") do |v|
        @options[:text] = v
      end
      
      opts.on("-O", "--dont-optimize", "Turn off all image optiomisations") do |v|
        @options[:optimize_images] = false
      end
    end.parse!
  end
  
  def job
    prepare_dirs
    prepare_ingredients
    prepare_marks
    
    update_groups
    process_ingredients
    
    unless errors?
      flush_links
      flush_json
      cleanup_deleted
    end
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::HT_ROOT]
  end
  
  def update_groups
    @ingredients_groups = YAML::load(File.open("#{Config::BASE_DIR}/groups.yaml"))
  end
  
  def prepare_ingredients
    if File.exists?(Config::DB_JS) && !@options[:force]
      @ingredients_mtime = File.mtime(Config::DB_JS)
      @entities = JSON.parse(File.read(Config::DB_JS))
    else
      @ingredients_mtime = nil
    end
  end
  
  def prepare_marks
    if File.exists?(Config::DB_JS_MARKS)
      @marks = JSON.parse(File.read(Config::DB_JS_MARKS)).to_a.hash_index("name")
    end
  end
  
  def process_ingredients
    say "обновляю ингредиенты"
    indent do
    done = 0
    Dir.new(Config::BASE_DIR).each_dir do |group_dir|
      say group_dir.name
      indent do
      group_dir.each_dir do |good_dir|
        if !@ingredients_mtime || good_dir.deep_mtime > @ingredients_mtime
          if good = find_good(good_dir, group_dir)
            done += 1
            good["group"] = group_dir.name
            good["name"] = good_dir.name
            @entities << good
            
            if names = read_names(good_dir)
              good["names"] = names
            else
              good.delete("names")
            end
          else
            warning "#{group_dir.name}: #{good_dir.name} не нашел описания"
          end
        end
      end
      end # indent
    end
    say "#{done.items("обновлен", "обновлено", "обновлено")} #{done} #{done.items("ингредиент", "ингредиента", "ингредиентов")}"
    end # indent
  end
  
  def find_good good_dir, group_dir
    errors = []
    good = process_good(good_dir, good_dir.name)
    if good
      found = true
    end
    
    good_dir.each_dir do |brand_dir|
      if found
        errors << [group_dir, good_dir, brand_dir]
      else
        if good = process_good(brand_dir, good_dir.name, brand_dir.name)
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
  
  def process_good dir, name, brand=nil
    about = dir.path + "/about.yaml"
    return unless File.exists?(about)
    
    say brand ? "#{name} (#{brand})" : name
    
    good = {}
    indent do
    about = YAML::load(File.open(about))
    
    ht_dir = Dir.create("#{Config::HT_ROOT}#{name.dirify}")
    good["ht_dir"] = ht_dir
    
    img = "#{dir.path}/i_big.png"
    if File.exists?(img)
      flush_masked_optimized(Config::BASE_DIR + "mask.png", img, "#{ht_dir.path}/preview.png") unless @options[:text]
    else
      error "нет большой картинки (файл #{img})"
    end
    
    legend = dir.path + "/about.txt"
    if File.exists?(legend)
      good["about"] = File.read(legend)
    else
      warning "нет файла с легендой ингредиента (about.txt)"
    end
    
    
    if about["Единица"]
      good[:unit] = about["Единица"]
    else
      error "не указана единица"
    end
    
    if about["Падежи"]
      good["decls"] = {"t" => about["Падежи"]["Творительный"]}
    end
    
    if brand
      good[:brand] = brand
      good[:brand_dir] = brand.dirify
      
      if about["Марка"]
        if @marks[about["Марка"]]
          good[:mark] = about["Марка"]
        else
          error "нет такой марки «#{about["Марка"]}»"
        end
      else
        error "не указана марка (бренд «#{brand}»)"
      end
    end
    
    if about["Тара"] and about["Тара"].length > 0
      volumes = []
      about["Тара"].each_with_index do |v, i|
        if v["Объем"] <= 0
          warning "нулевой или отрицательный объем (номер #{i+1})"
          next
        end
        
        if v["Цена"] <= 0
          warning "нулевая или отрицательная цена (номер #{i+1})"
          next
        end
        
        volumes << [v["Объем"], v["Цена"], v["Наличие"] == "есть"]
        
        vol_name = v["Объем"].to_s.gsub(".", "_")
        img = dir.path + "/" + vol_name + "_big.png"
        
        if File.exists?(img)
          cp_if_different(img, "#{ht_dir.path}/vol_#{vol_name}.png") unless @options[:text]
        else
          error "не могу найти картинку для объема «#{v["Объем"]}» (#{vol_name}_big.png)"
        end
      end
      # increment sort by cost per litre
      good[:volumes] = volumes.sort { |a, b| b[0] / b[1] - a[0] / a[1] }
    else
      error "тара не указана"
    end
    end # indent
    return good
  end
  
  def flush_json
    say "сохраняю данные об ингредиентах"
    ingredients = @entities.sort { |a, b| a["name"] <=> b["name"] }
    ingredients.each do |entity|
      update_json entity
    end
    flush_json_object(ingredients, Config::DB_JS)
    flush_json_object(@ingredients_groups, Config::DB_JS_GROUPS)
  end
  
  def update_json entity
    data = {}
    ht_dir = entity.delete("ht_dir")
    entity["path"] = ht_dir.name
    @local_properties.each do |prop|
      data[prop] = entity.delete(prop)
    end
    flush_json_object(data, "#{ht_dir.path}/data.json", "require.loaded(%s)")
  end
  
  def flush_links
    File.open(Config::NOSCRIPT_LINKS, "w+") do |links|
      links.puts "<ul>"
      group = ""
      @entities.each do |entity|
        if group != entity["group"]
          group = entity["group"]
          links.puts %Q{<li><b>#{group}</b></li>}
        end
        links.puts %Q{<li>#{entity["name"]}</li>}
      end
      links.puts "</ul>"
    end
  end
  
  def cleanup_deleted
    say "ищу удаленные"
    indent do
    index = @entities.hash_index("path")
    deleted = 0
    Dir.new(Config::HT_ROOT).each_dir do |dir|
      unless index[dir.name]
        say "удаляю #{dir.name}"
        FileUtils.rmtree(dir.path)
        deleted += 1
      end
    end
    if deleted == 0
      say "ничего не удалил"
    else
      warning "удалил #{deleted} #{deleted.plural("штуку", "штуки", "штук")}"
    end
    end # indent
  end
  
end

exit IngredientsProcessor.new.run
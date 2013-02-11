#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

require "inshaker"
require "entities/ingredient"
require "entities/mark"

class IngredientsProcessor < Inshaker::Processor
  
  module Config
    include Ingredient::Config
  end
  
  def initialize
    super
    @local_properties = ["about", "decls"]
    @entities = []
    @groups = []
    @groups_i = {}
    @marks = {}
    @tags = []
    @tags_ci = {}
    @tags_hidden = []
    @units = []
    @units_i = {}
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
    sync_base "Ingredients"
    fix_base "Ingredients"
    
    prepare_dirs
    prepare_ingredients
    prepare_marks
    
    update_groups_and_tags_and_units
    process_ingredients
    
    check_intergity
    
    unless errors?
      flush_links
      flush_json
      cleanup_deleted
    end
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::HT_ROOT]
  end
  
  def update_groups_and_tags_and_units
    @groups = YAML::load(File.open("#{Config::BASE_DIR}/groups.yaml"))
    @groups_i = @groups.hash_index
    @tags = YAML::load(File.open("#{Config::BASE_DIR}/known-tags.yaml"))
    @tags_ci = @tags.hash_ci_index
    @tags_hidden = YAML::load(File.open("#{Config::BASE_DIR}/hidden-tags.yaml"))
    @units = YAML::load(File.open("#{Config::BASE_DIR}/units.yaml"))
    @units_i = @units.hash_index
  end
  
  def prepare_ingredients
    if @options[:force]
      @ingredients_mtime = nil
    else
      @ingredients_mtime = File.mtime(Config::DB_JS)
    end
  end
  
  def prepare_marks
    @marks = JSON.parse(File.read(Mark::Config::DB_JS)).to_a.hash_index("name")
  end
  
  def process_ingredients
    say "обновляю ингредиенты"
    indent do
    done = 0
    Dir.new(Config::BASE_DIR).each_dir do |group_dir|
      group_name = group_dir.name
      say group_name
      unless @groups_i[group_name]
        error "нкизвестная группа «#{group_name}»"
        next
      end
      
      indent do
      group_dir.each_dir do |good_dir|
        if !@ingredients_mtime || good_dir.deep_mtime > @ingredients_mtime
          if good = find_good(good_dir, group_dir)
            done += 1
            good["group"] = group_name
            good["name"] = good_dir.name
            @entities << good
            
            if names = read_names(good_dir)
              good["names"] = names
            else
              good.delete("names")
            end
          else
            warning "#{group_name}: #{good_dir.name} не нашел описания"
          end
        end
      end
      end # indent
    end
    say "#{done.plural("обновлен", "обновлено", "обновлено")} #{done} #{done.plural("ингредиент", "ингредиента", "ингредиентов")}"
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
      # say "обновляю псевдонимы"
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
    
    img = "#{dir.path}/preview.png"
    if File.exists?(img)
      # flush_masked_optimized(Config::BASE_DIR + "mask.png", img, "#{ht_dir.path}/preview.png") unless @options[:text]
      convert_image(img, "#{ht_dir.path}/preview.jpg", 90, 100, 100) unless @options[:text]
    else
      error "нет картинки-превьюшки (файл #{img})"
    end
    
    img = "#{dir.path}/image.png"
    if File.exists?(img)
      # flush_masked_optimized(Config::BASE_DIR + "mask.png", img, "#{ht_dir.path}/preview.png") unless @options[:text]
      cp_if_different(img, "#{ht_dir.path}/image.png") unless @options[:text]
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
      good["unit"] = about["Единица"]
      unless @units_i[good["unit"]]
        error "неизвестная единица измерения «#{good["unit"]}»"
      end
    else
      error "не указана единица измерения"
    end
    
    if about["Падежи"]
      good["decls"] = {"t" => about["Падежи"]["Творительный"]}
    end
    
    if about["Текст названия"]
      good["screen"] = about["Текст названия"].to_s
    end
    
    good_tags = good["tags"] = []
    tags = about["Теги"] ? about["Теги"].split(/\s*,\s*/) : []
    
    if brand
      good[:brand] = brand
      
      if about["Марка"]
        if @marks[about["Марка"]]
          good[:mark] = about["Марка"]
          tags << good[:mark]
        else
          error "нет такой марки «#{about["Марка"]}»"
        end
      else
        error "не указана марка (бренд «#{brand}»)"
      end
    end
    
    
    tags.each do |tag_candidate|
      tag = @tags_ci[tag_candidate.ci_index]
      unless tag
        error "незнакомый тег «#{tag_candidate}»"
      end
      
      good_tags << tag
    end
    
    good_tags.sort!
    
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
      end
      # increment sort by cost per litre
      good["volumes"] = volumes.sort { |a, b| b[0] / b[1] - a[0] / a[1] }
    else
      error "тара не указана"
    end
    end # indent
    return good
  end
  
  def check_intergity
    
    tags_used = {"Любой ингредиент" => true}
    groups_used = {}
    
    @entities.each do |ingredient|
      ingredient["tags"].each do |tag|
        tags_used[tag] = true
      end
      
      groups_used[ingredient["group"]] = true
    end
    
    
    say "проверяю теги"
    indent do
      unused = @tags - tags_used.keys
    
      unless unused.empty?
        warning "нет ингредиентов с #{unused.length.plural("тегом", "тегами", "тегами")} #{unused.map{|v| "«#{v}»"}.join(", ")}"
      end
    
      # delete unused tags
      @tags -= unused
    end
    
    say "проверяю группы"
    indent do
      unused = @groups - groups_used.keys
    
      unless unused.empty?
        warning "нет ингредиентов с #{unused.length.plural("тегом", "тегами", "тегами")} #{unused.map{|v| "«#{v}»"}.join(", ")}"
      end
    
      # delete unused tags
      @groups -= unused
    end
    
  end
  
  def flush_json
    say "сохраняю данные об ингредиентах"
    
    ingredients = @entities.sort { |a, b| a["name"] <=> b["name"] }
    ingredients.each do |entity|
      update_json entity
    end
    flush_json_object(ingredients, Config::DB_JS)
    flush_json_object(@groups, Config::DB_JS_GROUPS)
    # hide hidden tags
    @tags -= @tags_hidden
    flush_json_object(@tags, Config::DB_JS_TAGS)
    flush_json_object(@units, Config::DB_JS_UNITS)
  end
  
  def update_json entity
    data = {}
    ht_dir = entity.delete("ht_dir")
    entity["path"] = ht_dir.name
    if entity["tags"].empty?
      entity.delete("tags")
    end
    @local_properties.each do |prop|
      data[prop] = entity.delete(prop)
    end
    flush_json_object(data, "#{ht_dir.path}/data.json", "require.data(%s)")
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
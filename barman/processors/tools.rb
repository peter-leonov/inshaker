#!/usr/bin/env ruby1.9
# encoding: utf-8
require "inshaker"
require "entities/ingredient"
require "entities/tool"

class ToolsProcessor < Inshaker::Processor
  
  module Config
    include Tool::Config
  end
  
  def initialize
    super
    @tools = []
  end
  
  def job_name
    "смешивалку штучек"
  end
  
  def job
    sync_base "Tools"
    
    prepare
    process
    flush_json
  end
  def prepare
    @units = YAML::load(File.open("#{Ingredient::Config::BASE_DIR}/units.yaml"))
    @units_i = @units.hash_index
  end
  
  def process
    path = Config::TOOLS_DIR
    Dir.new(path).each_dir do |group_dir|
      say group_dir.name
      indent do
      group_dir.each_dir do |tool_dir|
        say tool_dir.name
        indent do
          process_tool tool_dir, tool_dir.name, group_dir
        end # indent
      end
      end # indent
    end
    say "Нашел #{@tools.length} #{@tools.length.plural('штучка', 'штучки', 'штучек')}"
  end
  
  def process_tool dir, name, group_dir
    tool = {}
    tool["group"] = group_dir.name
    tool["name"] = dir.name
    if File.exists?("#{dir.path}/about.txt")
      tool["desc"] = File.open("#{dir.path}/about.txt").read.html_paragraphs
    else
      tool["desc"] = ""
    end
    tool["path"] = dir.name.dirify
    
    about = dir.path + "/about.yaml"
    if File.exists?(about)
      about = YAML::load(File.open(about))
      if about["Единица"]
        tool["unit"] = about["Единица"]
        unless @units_i[tool["unit"]]
          error "неизвестная единица измерения «#{tool["unit"]}»"
        end
      else
        error "не указана единица измерения"
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
        end
        # increment sort by cost per litre
        tool["volumes"] = volumes.sort { |a, b| b[0] / b[1] - a[0] / a[1] }
      else
        error "тара не указана"
      end
    else
      warning "нет описания штучки (about.yaml)"
    end
    
    
    ht_dir = Dir.create("#{Config::HT_ROOT}/#{name.dirify}/")
    
    img = "#{dir.path}/preview.png"
    if File.exists?(img)
      convert_image(img, "#{ht_dir.path}/preview.jpg", 90, 100, 100)
    else
      warning "нет картинки-превьюшки (файл #{img})"
    end
    
    img = "#{dir.path}/image.png"
    if File.exists?(img)
      cp_if_different(img, "#{ht_dir.path}/image.png")
    else
      error "нет большой картинки (файл #{img})"
    end
    
    
    @tools << tool
  end
  
  def flush_json
    flush_json_object(@tools, Config::DB_JS)
  end
end

exit ToolsProcessor.new.run
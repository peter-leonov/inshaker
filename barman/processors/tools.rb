#!/usr/bin/env ruby1.9
# encoding: utf-8
require "inshaker"
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
    flush_json
  end
  
  def prepare
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
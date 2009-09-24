#!/usr/bin/ruby
require 'barman'
require 'lib/string_util_1.8'
$KCODE = 'u'

class ToolsProcessor < Barman::Processor
  
  module Config
    TOOLS_DIR  = Barman::BASE_DIR + "Tools" 
    HTDOCS_DIR = Barman::HTDOCS_DIR
    
    TOOLS_ROOT = HTDOCS_DIR + "i/merchandise/tools/"
    DB_JS      = HTDOCS_DIR + "db/tools.js"
  end
  
  def initialize
    super
    @tools = []
  end
  
  def job
    prepare_dirs
    prepare
    flush_images
    flush_json
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::TOOLS_ROOT]
  end
  
  def prepare
    path = Config::TOOLS_DIR
    Dir.new(path).each do |group|
      if !@excl.include?(group)
        Dir.new("#{path}/#{group}").each do |name|
          if !@excl.include?(name)
            @tool = {}
            @tool[:group] = group
            @tool[:name] = name
            if File.exists?("#{Config::TOOLS_DIR}/#{group}/#{name}/about.txt")
              @tool[:desc] = File.open("#{Config::TOOLS_DIR}/#{group}/#{name}/about.txt").read.html_paragraphs
            else
              @tool[:desc] = ""
            end
            @tools << @tool
          end
        end
      end
    end
  end
  
  def flush_json
    flush_json_object(@tools, Config::DB_JS)
  end
  
  def flush_images
    @tools.each do |t|
      from = "#{Config::TOOLS_DIR}/#{t[:group]}/#{t[:name]}/image.png"
      to   = "#{Config::TOOLS_ROOT}/#{t[:name].trans}.png"
      FileUtils.cp_r(from, to, @mv_opt) unless !File.exists?(from)
    end
  end
end

exit ToolsProcessor.new.run
#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'

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
  
  def job_name
    "смешивалку штучек"
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
    Dir.new(path).each_dir do |group_dir|
      say group_dir.name
      indent do
      group_dir.each_dir do |tool_dir|
        say tool_dir.name
        indent do
        @tool = {}
        @tool["group"] = group_dir.name
        @tool["name"] = tool_dir.name
        if File.exists?("#{tool_dir.path}/about.txt")
          @tool[:desc] = File.open("#{tool_dir.path}/about.txt").read.html_paragraphs
        else
          @tool[:desc] = ""
        end
        @tools << @tool
        end # indent
      end
      end # indent
    end
  end
  
  def flush_json
    flush_json_object(@tools, Config::DB_JS)
  end
  
  def flush_images
    @tools.each do |t|
      from = "#{Config::TOOLS_DIR}/#{t["group"]}/#{t["name"]}/image.png"
      to   = "#{Config::TOOLS_ROOT}/#{t["name"].trans}.png"
      FileUtils.cp_r(from, to, @mv_opt) unless !File.exists?(from)
    end
  end
end

exit ToolsProcessor.new.run
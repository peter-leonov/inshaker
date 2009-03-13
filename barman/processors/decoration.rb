#!/usr/bin/ruby
require 'barman'

class DecorationProcessor < Barman::Processor
  
  module Config
    DECORATION_DIR = Barman::BASE_DIR + "Decoration/"
    HTDOCS_DIR = Barman::HTDOCS_DIR
    BACKS_DIR  = HTDOCS_DIR + "t/bg"
    THEME_FILE = HTDOCS_DIR + "t/theme.css"
    
    DB_JS = HTDOCS_DIR + "db/decoration.js"
  end
  
  def run
    @params = {}
    @params[:links]       = YAML::load(File.open(Config::DECORATION_DIR + "Links/links.yaml"))['Inshaker рекомендует']
    @params[:promos]      = YAML::load(File.open(Config::DECORATION_DIR + "Promos/promos.yaml"))['Промо']
    @params[:cocktails]   = YAML::load(File.open(Config::DECORATION_DIR + "cocktails.yaml"))['Коктейли']
    @params[:spotlighted] = YAML::load(File.open(Config::DECORATION_DIR + "Spotlighted/spotlighted.yaml"))['В центре внимания'][0]
    
    flush_links_and_promo
    flush_backgrounds
    flush_spotlighted
    flush_json
  end

  def debug
    puts @params.inspect
  end
    
  def flush_links_and_promo
    to_copy = ["Links", "Promos"]
    
    to_copy.each do |dir|
      src_dir  = Config::DECORATION_DIR + dir
      dest_dir = Config::HTDOCS_DIR + "i/index/" + dir.downcase

      FileUtils.rm_rf dest_dir
      FileUtils.mkdir_p dest_dir
    
      Dir.new(src_dir).each do |f|
        if f =~ /\d+\.(png|jpg)$/
          FileUtils.cp_r "#{src_dir}/#{f}", "#{dest_dir}/#{f}", @mv_opt 
        end 
      end
    end
  end
  
  def flush_spotlighted
    FileUtils.cp_r "#{Config::DECORATION_DIR}/Spotlighted/icon.png", "#{Config::HTDOCS_DIR}/t/icon/spotlighted.png", @mv_opt
  end

  def flush_backgrounds
    backs = Config::DECORATION_DIR + "Backgrounds"
    FileUtils.rm_rf Config::THEME_FILE

    Dir.new(backs).each do |f|
      if f=~ /(\w+)\.(png|jpg)$/
        out_dir = "#{Config::BACKS_DIR}/#{$1}"
        FileUtils.mkdir_p out_dir
        FileUtils.cp_r "#{backs}/#{f}", "#{out_dir}/bg.#{$2}", @mv_opt
        
        File.open(Config::THEME_FILE, "a+") do |theme|
          theme.puts get_theme_entry($1, $2)
          theme.close
        end

      end
    end
  end
  
  def flush_json
    flush_json_object(@params, Config::DB_JS)
  end

private 
  
  def get_theme_entry page, bg_ext
    return "##{page}-page, body.#{page}-page {background:transparent url(bg/#{page}/bg.#{bg_ext}) repeat-x -139px -141px;} "
  end
  
end

DecorationProcessor.new.run

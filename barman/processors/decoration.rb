#!/usr/bin/ruby
require 'barman'
require 'lib/string_util_1.8'
$KCODE = 'u'

class DecorationProcessor < Barman::Processor
  
  module Config
    DECORATION_DIR = Barman::BASE_DIR + "Decoration/"
    HTDOCS_DIR = Barman::HTDOCS_DIR
    BACKS_DIR  = HTDOCS_DIR + "t/bg"
    THEME_FILE = HTDOCS_DIR + "t/theme.css"
    
    DB_JS = HTDOCS_DIR + "db/decoration.js"
  end
  
  def run
    @theme = YAML::load(File.open(Config::DECORATION_DIR + "decoration.yaml"))['Выбранная тема'] 
    @theme_dir  = Config::DECORATION_DIR + @theme + "/"
    
    @params = {}
    @params[:links]       = YAML::load(File.open(@theme_dir + "Links/links.yaml"))['Inshaker рекомендует']
    @params[:promos]      = YAML::load(File.open(@theme_dir + "Promos/promos.yaml"))['Промо']
    @params[:cocktails]   = YAML::load(File.open(@theme_dir + "cocktails.yaml"))['Коктейли']
    @params[:spotlighted] = YAML::load(File.open(@theme_dir + "Spotlighted/spotlighted.yaml"))['В центре внимания'][0]
    
    flush_links_and_promo
    flush_spotlighted
    flush_json
    flush_theme_files
    flush_backgrounds
    #debug
  end

  def debug
    puts @params.inspect
  end
    
  def flush_links_and_promo
    to_copy = ["Links", "Promos"]
    
    to_copy.each do |dir|
      src_dir  = @theme_dir + dir
      dest_dir = Config::HTDOCS_DIR + "i/index/" + dir.downcase

      FileUtils.mkdir_p dest_dir
    
      Dir.new(src_dir).each do |f|
        if f =~ /\d+\.(png|jpg)$/
          FileUtils.cp_r "#{src_dir}/#{f}", "#{dest_dir}/#{f}", @mv_opt 
        end 
      end
    end
  end
  
  def flush_spotlighted
    FileUtils.cp_r "#{@theme_dir}/Spotlighted/icon.png", "#{Config::HTDOCS_DIR}/t/icon/spotlighted.png", @mv_opt
  end

  def flush_backgrounds
    backs = @theme_dir + "Backgrounds"
    #FileUtils.rm_rf Config::THEME_FILE

    Dir.new(backs).each do |f|
      if f=~ /(\w+)\.(png|jpg)$/
        out_dir = "#{Config::BACKS_DIR}/#{$1}"
        FileUtils.mkdir_p out_dir
        FileUtils.cp_r "#{backs}/#{f}", "#{out_dir}/bg.#{$2}", @mv_opt
        
        #File.open(Config::THEME_FILE, "a+") do |theme|
        #  theme.puts get_theme_entry($1, $2)
        #  theme.close
        #end

      end
    end
  end
  
  def flush_json
    flush_json_object(@params, Config::DB_JS)
  end

  def flush_theme_files
    puts "Selected theme: #{@theme}"
    FileUtils.cp_r "#{@theme_dir}/UI/.", Config::HTDOCS_DIR
  end

private 
  
  def get_theme_entry page, bg_ext
    return "##{page}-page body, .#{page}-page body { background-image:url(bg/#{page}/bg.#{bg_ext}) } "
  end
  
end

DecorationProcessor.new.run

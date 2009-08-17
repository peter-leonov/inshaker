#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'

class DecorationProcessor < Barman::Processor
  
  module Config
    DECORATION_DIR = Barman::BASE_DIR + "Decoration/"
    HTDOCS_DIR = Barman::HTDOCS_DIR
    BACKS_DIR  = HTDOCS_DIR + "t/bg"
    THEME_FILE = HTDOCS_DIR + "t/theme.css"
  end
  
  def run
    @theme = YAML::load(File.open(Config::DECORATION_DIR + "decoration.yaml"))['Выбранная тема'] 
    @theme_dir  = Config::DECORATION_DIR + @theme + "/"
    
    flush_theme_files
    flush_backgrounds
  end
  
  def flush_backgrounds
    backs = @theme_dir + "Backgrounds"
    #FileUtils.rm_rf Config::THEME_FILE
    
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

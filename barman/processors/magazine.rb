#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'

class MagazineProcessor < Barman::Processor
  
  module Config
    DECORATION_DIR = Barman::BASE_DIR + "Magazine/"
    HTDOCS_DIR = Barman::HTDOCS_DIR
    
    DB_JS = HTDOCS_DIR + "db/magazine.js"
  end
  
  def run
    about = YAML::load(File.open(Config::DECORATION_DIR + "about.yaml"))
    
    @params = {}
    @params["links"]       = about['Inshaker рекомендует']
    @params["promos"]      = about['Промо']
    @params["cocktails"]   = about['Коктейли']
    
    flush_links_and_promo
    flush_json
  end

  def flush_links_and_promo
    to_copy = ["links", "promos"]
    
    to_copy.each do |dir|
      src_dir  = Config::DECORATION_DIR + dir
      dest_dir = Config::HTDOCS_DIR + "i/index/" + dir
      
      FileUtils.mkdir_p dest_dir
      
      Dir.new(src_dir).each do |f|
        if f =~ /\d+\.(png|jpg)$/
          FileUtils.cp_r "#{src_dir}/#{f}", "#{dest_dir}/#{f}", @mv_opt 
        end 
      end
    end
  end
  
  def flush_json
    flush_json_object(@params, Config::DB_JS)
  end
end

MagazineProcessor.new.run

#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require 'barman'

class BarmenProcessor < Barman::Processor

  module Config
    COCKTAILS_DB = Barman::HTDOCS_DIR + "db/cocktails.js"
    BARMEN_DIR = Barman::BASE_DIR + "Barmen/"
    HTDOCS_DIR = Barman::HTDOCS_DIR
    IMAGES_DIR = HTDOCS_DIR + "i/barmen/"
    DB_JS      = HTDOCS_DIR  + "db/barmen.js"
  end
  
  def job_name
    "смешивалку барменов"
  end
  
  def job
    @cocktails = {}
    @barmen = []
    prepare_cocktails
    prepare_barmen
    flush_json
  end
  
  def prepare_cocktails
    if File.exists?(Config::COCKTAILS_DB)
      @cocktails = load_json(Config::COCKTAILS_DB)
    end
  end
  
  def prepare_barmen
    root_dir = Dir.new(Config::BARMEN_DIR)
    root_dir.each do |barman_dir|
      barman_path = root_dir.path + barman_dir
      if File.ftype(barman_path) == "directory" and !@excl.include?(barman_dir)
        puts "..#{barman_dir}" 
        if File.exists?(barman_path + "/about.txt") 
          about = YAML::load(File.open(barman_path + "/about.txt").read)
          barman = {}
          barman[:name] = barman_dir
          barman[:name_eng] = about["Name"]
          barman[:desc] = about["О бармене"]
          if cocktails = about["Коктейли"]
            cocktails.each do |name|
              unless @cocktails[name]
                error "нет такого коктейля «#{name}»"
                if name.has_diacritics
                  say "пожалуйста, проверь буквы «й» и «ё» на «правильность»"
                end
              end
            end
            barman[:cocktails] = cocktails
          end
          
          @barmen << barman
          FileUtils.cp_r(barman_path + "/photo.jpg", Config::IMAGES_DIR + barman[:name_eng].html_name + ".jpg", @mv_opt)
        end
      end
    end
  end

  def flush_json
    flush_json_object(@barmen, Config::DB_JS)
  end
end 

exit BarmenProcessor.new.run
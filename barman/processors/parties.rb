#!/usr/bin/ruby
require 'barman'
require 'lib/string_util_1.8'
$KCODE = 'u'

class PartiesProcessor < Barman::Processor
  
  module Config
    BARS_DIR    = Barman::BASE_DIR + "Bars/"
    HTDOCS_DIR  = Barman::HTDOCS_DIR
    
    IMAGES_ROOT = HTDOCS_DIR + "i/party/"
    DB_JS = HTDOCS_DIR + "db/parties.js"
  end
  
  def initialize
    super
    @parties = {}
    @party = {}
  end
  
  def run
    prepare
    flush_images
    flush_json
  end
  
  def prepare
    root_dir = Dir.new(Config::BARS_DIR)
    root_dir.each do |city_dir|
      city_path = root_dir.path + city_dir
      if File.ftype(city_path) == "directory" and !@excl.include?(city_dir)
        @parties[city_dir] = []
        bars_dir = Dir.new(city_path)
        bars_dir.each do |bar_dir|
          bar_path = bars_dir.path + "/" + bar_dir
          if File.ftype(bar_path) == "directory" and !@excl.include?(bar_dir)
            if File.exists?(bar_path + "/parties")
              bar_parties_dir = Dir.new(bar_path + "/parties")
              bar_parties_dir.each do |party_dir|
                party_path = bar_parties_dir.path + "/" + party_dir
                if File.ftype(party_path) == "directory" and !@excl.include?(party_dir)
                  @party = {}
                  @party[:name] = party_dir
                  @party[:bar]  = bar_dir
                  @party[:city] = city_dir
                  @party[:big_images_count] = get_big_images_count
                  parse_about_text(File.open(party_path + "/about.txt").read)
                  @parties[city_dir] << @party
                  puts ".." + party_dir
                end
              end
            end
          end
        end
      end
    end
  end
  
  def flush_images
    @parties.each do |city, parties_arr|
      parties_arr.each do |party|
        from_path = Config::BARS_DIR + city + "/" + party[:bar] + "/parties/" + party[:name] + "/"
        to_path   = Config::IMAGES_ROOT + city.trans.html_name
        if !File.exists?(to_path) then FileUtils.mkdir_p(to_path) end
        
        if File.exists?(from_path + "mini.png")
          FileUtils.cp_r(from_path + "mini.png", to_path + "/" + party[:bar].trans.html_name + "-" + party[:name].trans.html_name + "-mini.png", @mv_opt)
        end
        
        counter = 1
        while File.exists?(from_path + "big-#{counter}.jpg")
          FileUtils.cp_r(from_path + "big-#{counter}.jpg", to_path + "/" + party[:bar].trans.html_name + "-" + party[:name].trans.html_name + "-big-#{counter}.jpg", @mv_opt)
          counter +=1
        end
      end
    end
  end
  
  def get_big_images_count
    from_path = Config::BARS_DIR + @party[:city] + "/" + @party[:bar] + "/parties/" + @party[:name] + "/"
    counter = 0
    while File.exists?(from_path + "big-#{counter+1}.jpg")
      counter +=1
    end
    counter
  end
  
  def flush_json
    flush_json_object(@parties, Config::DB_JS)
  end
  
private

  def parse_about_text(txt)
    @party[:payment_type] = (txt.scan /.*Тип оплаты:\ (.+)\ *\n.*/)[0][0]
    @party[:payment_amount] = (txt.scan /.*Размер оплаты:\ (.+)\ *\n.*/)[0][0].to_f
    @party[:max_guests] = (txt.scan /.*Максимум гостей:\ (.+)\ *\n.*/)[0][0].to_f
    @party[:number] = (txt.scan /.*Номер в списке:\ (.+)\ *.*/)[0][0].to_i
  end
end

PartiesProcessor.new.run
module PartiesConfig
  INSHAKER_ROOT = "/www/inshaker/"
  
  BARS_DIR = INSHAKER_ROOT + "barman/base/Bars/"
  
  OUT_ROOT       = INSHAKER_ROOT + "htdocs/"
  OUT_IMAGES_DIR = OUT_ROOT + "i/party/"
  
  OUT_JS_DB = OUT_ROOT + "js/common/db-parties.js"
  
  MV_OPT = {:remove_destination => true}
end

class PartiesProcessor
  def initialize
    @parties = {}
    @party = {}
  end
  
  def run
    prepare_parties
    flush_images
    flush_json
  end
  
  def prepare_parties
    excluded = [".", "..", ".svn", ".TemporaryItems", ".DS_Store"]
    
    root_dir = Dir.new(PartiesConfig::BARS_DIR)
    root_dir.each do |city_dir|
      city_path = root_dir.path + city_dir
      @parties[city_dir] = []
      if File.ftype(city_path) == "directory" and !excluded.include?(city_dir)
        bars_dir = Dir.new(city_path)
        bars_dir.each do |bar_dir|
          bar_path = bars_dir.path + "/" + bar_dir
          if File.ftype(bar_path) == "directory" and !excluded.include?(bar_dir)
            if File.exists?(bar_path + "/parties")
              bar_parties_dir = Dir.new(bar_path + "/parties")
              bar_parties_dir.each do |party_dir|
                party_path = bar_parties_dir.path + "/" + party_dir
                if File.ftype(party_path) == "directory" and !excluded.include?(party_dir)
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
        from_path = PartiesConfig::BARS_DIR + city + "/" + party[:bar] + "/parties/" + party[:name] + "/"
        to_path   = PartiesConfig::OUT_IMAGES_DIR + city.trans.html_name
        if !File.exists?(to_path) then FileUtils.mkdir_p(to_path) end
        
        if File.exists?(from_path + "mini.png")
          FileUtils.cp_r(from_path + "mini.png", to_path + "/" + party[:bar].trans.html_name + "-" + party[:name].trans.html_name + "-mini.png", PartiesConfig::MV_OPT)
        end
        
        counter = 1
        while File.exists?(from_path + "big-#{counter}.jpg")
          FileUtils.cp_r(from_path + "big-#{counter}.jpg", to_path + "/" + party[:bar].trans.html_name + "-" + party[:name].trans.html_name + "-big-#{counter}.jpg", BarsConfig::MV_OPT)
          counter +=1
        end
      end
    end
  end
  
  def get_big_images_count
    from_path = PartiesConfig::BARS_DIR + @party[:city] + "/" + @party[:bar] + "/parties/" + @party[:name] + "/"
    counter = 0
    while File.exists?(from_path + "big-#{counter+1}.jpg")
      counter +=1
    end
    counter
  end
  
  def flush_json
    parties_json = ActiveSupport::JSON.encode(@parties).unescape
    
    File.open(PartiesConfig::OUT_JS_DB, "w+") do |db|
     db.puts "DB.Parties.initialize("
     db.puts parties_json
     db.puts ")\n\n"
     db.close
    end
  end
  
private

  def parse_about_text(txt)
    @party[:payment_type] = (txt.scan /.*Тип оплаты:\ (.+)\ *\n.*/)[0][0]
    @party[:payment_amount] = (txt.scan /.*Размер оплаты:\ (.+)\ *\n.*/)[0][0].to_f
    @party[:max_guests] = (txt.scan /.*Максимум гостей:\ (.+)\ *\n.*/)[0][0].to_f
    @party[:number] = (txt.scan /.*Номер в списке:\ (.+)\ *.*/)[0][0].to_i
  end
end

#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require "barman"

class Processor < Barman::Processor
  
  module Config
    ROOT = "/Users/peter/Desktop/dates/"
  end
  
  def job_name
    "угадывалку дат"
  end
  
  def job
    
    ignore = {
      "Peter Leonov" => true,
      "Uncle JorJ" => true,
      "UncleJorJ" => true,
      "Anton Byrna" => true
    }
    
    commits = File.read("#{Config::ROOT}/commits.txt").scan(/^(\w{40}) (\d+) '([^']+)'/).reverse
    
    seen = {}
    
    commits.each do |c|
      
      author = c[2]
      if ignore[author]
        next
      end
      
      hash = c[0]
      
      db_path = "#{Config::ROOT}/db/#{hash}-cocktails.js"
      unless File.exists?(db_path)
        next
      end
      
      begin
        db = load_json(db_path)
      rescue Exception => e
        # warning "кривой json в коммите #{hash}"
        next
      end
      
      time = c[1].to_i
      
      db.each do |name, cocktail|
        name = name.strip
        if seen[name]
          next
        end
        seen[name] = time
        
        say "#{name}, #{Time.at(time).strftime("%d.%m.%Y")}, #{hash}"
      end
    end
    
    flush_json_object(seen, "#{Config::ROOT}/date-by-cocktail.json")
    
  end
end

exit Processor.new.run
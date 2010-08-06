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
    
    commits = File.read("#{Config::ROOT}/commits.txt").scan(/^(\w{40}) (\d+)/).reverse
    
    commits.each do |c|
      hash = c[0]
      date = Time.at(c[1].to_i)
      say "#{date.strftime("%d.%m.%Y")} (#{hash})"
    end
    
  end
end

exit Processor.new.run
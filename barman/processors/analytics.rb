#!/usr/bin/env ruby1.9
# encoding: utf-8

require "lib/json"
require "lib/output"

require "config"

class Analytics
  
  module Config
    
  end
  
  def job
    
    update
    
    unless errors?
      flush_json
    end
  end
  
  def update
    
  end
  
  def flush_json
    
  end
  
  def run
    begin
      job
      summary
    rescue => e
      error "Паника: #{e.to_s.force_encoding('UTF-8')}"
      raise e
    end
    
    return errors_count
  end
  
end


$stdout.sync = true
exit Analytics.new.run

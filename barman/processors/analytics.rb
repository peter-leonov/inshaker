#!/usr/bin/env ruby1.9
# encoding: utf-8

require "lib/json"
require "lib/file"
require "lib/output"

require "config"

class Analytics
  
  module Config
    PROFILE_ID     = "9038802"
    BASE_DIR       = Inshaker::BASE_DIR + "Blog/"
    AUTH_URI       = "https://www.google.com/accounts/ClientLogin"
    LOGIN          = ENV["ANALYTICS_EMAIL"]
    PASSWORD       = ENV["ANALYTICS_PASSWORD"]
    
    TMP            = Inshaker::ROOT_DIR + "/barman/tmp"
    TOKEN_FILE     = TMP + "/auth-token.txt"
  end
  
  def job
    
    if login
      update
    end
    
    unless errors?
      flush_json
    end
  end
  
  def login
    
    # try to use recent login token
    
    if File.exists?(Config::TOKEN_FILE) && Time.now - File.mtime(Config::TOKEN_FILE) < 60 * 60
      @token = File.read(Config::TOKEN_FILE)
      return true
    end
    
    # based on http://gdatatips.blogspot.com/2008/08/perform-clientlogin-using-curl.html
    io = IO.popen(["curl", Config::AUTH_URI, "-s", "-d", "accountType=GOOGLE", "-d" "Email=#{Config::LOGIN}", "-d", "Passwd=#{Config::PASSWORD}", "-d", "service=analytics", "-d", "source=inshaker"])
    r = io.read
    io.close
    
    
    token = /^Auth=(\S{100,})/.match(r)
    unless token
      error "не удалось залогиниться"
      return false
    end
    
    @token = token[1]
    File.write(Config::TOKEN_FILE, @token)
    
    return true
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

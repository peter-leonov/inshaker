#!/usr/bin/env ruby1.9
# encoding: utf-8

require "config"

require "lib/json"

class Stats
  
  module Config
    CLIENT_ID      = "3164701909-cl0sa37gnh889cr5f043t6aeim88r7gk.apps.googleusercontent.com"
    TOKEN_URI      = "https://accounts.google.com/o/oauth2/token"
    SECRET         = ENV["ANALYTICS_CLIENT_SECRET"]
    TOKEN_REFRESH  = "1/db0zlC0q9jiRo6vlQ45zWnFx32ER3orsVS089-NKCao"
  end
  
  def refresh
    
    r = IO.popen(["curl", "-s", "-d", "client_id=#{Config::CLIENT_ID}", "-d", "client_secret=#{Config::SECRET}", "-d", "refresh_token=#{Config::TOKEN_REFRESH}", "-d", "grant_type=refresh_token", Config::TOKEN_URI]).read
    
    # puts r
    
    r = JSON.parse(r)
    
    unless r["access_token"]
      return false
    end
    
    @token = r["access_token"]
    
    true
  end
  
  
  def run
    
    unless refresh
      error "не удалось получить доступ"
      return 123
    end
    
    Dir.chdir("#{Inshaker::ROOT_DIR}/analytic")
    
    ENV["ANALYTICS_ACCESS_TOKEN"] = @token
    system("./update.sh")
  end
  
end

$stdout.sync = true
exit Stats.new.run

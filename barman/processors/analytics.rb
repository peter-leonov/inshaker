#!/usr/bin/env ruby1.9
# encoding: utf-8

require "digest/md5"
require "lib/json"
require "lib/string"
require "lib/array"
require "lib/file"
require "lib/output"

require "config"
require "entities/entity"
require "entities/cocktail"

class Analytics
  
  module Config
    PROFILE_ID     = "9038802"
    BASE_DIR       = Inshaker::BASE_DIR + "Blog/"
    AUTH_URI       = "https://www.google.com/accounts/ClientLogin"
    DATA_URI       = "https://www.google.com/analytics/feeds/data"
    LOGIN          = ENV["ANALYTICS_EMAIL"]
    PASSWORD       = ENV["ANALYTICS_PASSWORD"]
    
    TMP            = Inshaker::ROOT_DIR + "/barman/tmp"
    TOKEN_FILE     = TMP + "/auth-token.txt"
    
    HT_VIEWS_JSON  = Inshaker::HTDOCS_DIR + "/db/stats/views.json"
  end
  
  def job
    
    Cocktail.init
    
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
  
  def get url
    
    hash = Digest::MD5.hexdigest(url)
    cache = "#{Config::TMP}/#{hash}.url.txt"
    if File.exists?(cache) && Time.now - File.mtime(cache) < 60 * 60
      return File.read(cache)
    end
    
    io = IO.popen(["curl", url, "-s", "--header", "Authorization: GoogleLogin Auth=#{@token}"])
    r = io.read
    io.close
    
    File.write(cache, r)
    
    return r
  end
  
  def report query, start, endd, results=100
    get Config::DATA_URI +
        "?ids=ga:#{Config::PROFILE_ID}" +
        "&#{query}&start-date=#{start.strftime("%Y-%m-%d")}&end-date=#{endd.strftime("%Y-%m-%d")}&max-results=#{results}&prettyprint=true&alt=json"
  end
  
  def update
     data = JSON.parse(report("dimensions=ga:pagePath&metrics=ga:pageviews,ga:uniquePageviews&filters=ga:pagePath=~^/cocktail/&sort=-ga:pageviews", Time.new(2010, 11, 1), Time.new(2011, 10, 13), 2000))
     
     @views_stats = parse_pageviews(data)
  end
  
  def parse_pageviews data
    stats = Hash::new do |h, k|
      h[k] = Hash::new(0)
    end
    
    data["feed"]["entry"].each do |entry|
      
      v = entry["dxp$dimension"][0]
      unless v["name"] = "ga:pagePath"
        error "ga:pagePath переехал"
      end
      path = v["value"]
      
      v = entry["dxp$metric"][0]
      unless v["name"] = "ga:pageviews"
        error "ga:pageviews переехал"
      end
      pv = v["value"].to_i
      
      v = entry["dxp$metric"][1]
      unless v["name"] = "ga:uniquePageviews"
        error "ga:uniquePageviews переехал"
      end
      upv = v["value"].to_i
      
      if upv > pv
        error "уникальных больше чем просмотров"
      end
      
      
      path = /\/cocktail\/+([^\/]+)\//.match(path)
      unless path
        error "не могу найти название коктейля в пути «#{path}»"
        next
      end
      path = path[1]
      
      cocktail = Cocktail.by_path(path)
      unless cocktail
        warning "не могу найти коктейль для пути «#{path}»"
        next
      end
      
      name = cocktail["name"]
      
      puts "#{name}: #{pv} #{upv}"
      
      stats[name]["pageviews"] += pv
      stats[name]["uniques"] += upv
    end
    
    return stats
  end
  
  def flush_json
    views_stats = []
    @views_stats.keys.sort.each do |k|
      v = @views_stats[k]
      views_stats << {
        "name" => k,
        "pv" => v["pageviews"],
        "upv" => v["uniques"]
      }
    end
    
    File.write(Config::HT_VIEWS_JSON, JSON.stringify(views_stats))
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

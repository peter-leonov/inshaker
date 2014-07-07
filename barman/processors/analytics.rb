#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

require 'byebug'
require 'google/api_client'
require "optparse"
require "date"

require "lib/json"
require "lib/string"
require "lib/array"
require "lib/file"
require "lib/output"

require "config"
require "entities/entity"
require "entities/cocktail"

class Analytics
  
  MINUTE = 60
  HOUR = MINUTE * 60
  DAY  = 24 * 60 * 60
  
  module Config
    PROFILE_ID                    = "ga:9038802"
    SERVICE_ACCOUNT_EMAIL_ADDRESS = '971471176148-84gsvj1nv6lrhpbbinhlharprqdmavd3@developer.gserviceaccount.com'
    PATH_TO_KEY_FILE              = Inshaker::ROOT_DIR + '/barman/9e74ff16424f117e894c1d93a0895184166c938f-privatekey.p12'
    
    REPORTER_DIR   = Inshaker::HTDOCS_DIR + "/reporter/db/stats"
    ALL_JSON       = REPORTER_DIR + "/all.json"
    LAST_UP_JSON   = REPORTER_DIR + "/last-updated.json"
    
    HT_STAT_DIR    = Inshaker::HTDOCS_DIR + "/db/stats"
    VISITS_JSON    = HT_STAT_DIR + "/visits.json"
    CITIES_JSON    = HT_STAT_DIR + "/cities.json"
    BROWSERS_JSON  = HT_STAT_DIR + "/browsers.json"
    BROWSERSP_JSON = HT_STAT_DIR + "/browsers-plain.json"
    ERRORS_JSON    = HT_STAT_DIR + "/errors.json"
    
    HT_RATING_JSON = Inshaker::HTDOCS_DIR + "/db/ratings/rating.json"
  end
  
  def initialize
    @all = []
  end
  
  def process_options
    @options = {}
    OptionParser.new do |opts|
      opts.banner = "Запускайте так: analytics.rb [опции]"
      
      opts.on("-q", "--quite", "сообщать только об ошибках") do |v|
        quite!
      end
    end.parse!
  end
  
  def job
    process_options
    
    Cocktail.init
    
    if get_credentials
      get_last_updated
      update
      set_last_updated
      flush_all_json
    else
      error "не удалось получить доступ"
    end
  end
  
  def get_credentials
    @client = Google::APIClient.new(application_name: 'Inshaker', application_version: 1.0)
    
    @client.authorization = Signet::OAuth2::Client.new(
      :token_credential_uri => 'https://accounts.google.com/o/oauth2/token',
      :audience             => 'https://accounts.google.com/o/oauth2/token',
      :scope                => 'https://www.googleapis.com/auth/analytics.readonly',
      :issuer               => Config::SERVICE_ACCOUNT_EMAIL_ADDRESS,
      :signing_key          => Google::APIClient::PKCS12.load_key(Config::PATH_TO_KEY_FILE, 'notasecret')
    ).tap { |auth| auth.fetch_access_token! }

    @api_method = @client.discovered_api('analytics','v3').data.ga.get
  end
  
  
  def get_last_updated
    @last_updated = Time.at(JSON.parse(File.read(Config::LAST_UP_JSON))[0])
  end
  
  def set_last_updated
    File.write(Config::LAST_UP_JSON, [Time.now.to_i].to_json)
  end
  
  def report query, start, endd, results=100
    mandatory =
    {
      'ids'        => Config::PROFILE_ID,
      'start-date' => start.strftime("%Y-%m-%d"),
      'end-date'   => endd.strftime("%Y-%m-%d")
    }
    result = @client.execute(:api_method => @api_method, :parameters => mandatory.merge(query))
    result.data
  end
  
  def get_pageviews start, endd
    query =
    {
      "dimensions" => "ga:pagePath",
      "metrics" => "ga:pageviews,ga:uniquePageviews",
      "filters" => "ga:pagePath=~^/cocktails?/",
      "sort" => "-ga:pageviews"
    }
    result = report(query, start, endd, 10000)
    parse_pageviews(result)
  end
  
  def cocktails_pageviews name, start, endd
    dst = Config::REPORTER_DIR + "/" + name + ".json"
    
    # do not re-calculate stats older than four days
    if @last_updated - endd > 4 * DAY and File.exists?(dst)
      return true
    end
    
    views_stats, total_pageviews, total_uniques = get_pageviews(start, endd)
    
    if errors?
      return false
    end
    
    
    stats = {}
    views_stats.keys.sort.each do |k|
      v = views_stats[k]
      stats[k] = [v["pageviews"], v["uniques"]]
    end
    
    stats["$total"] = [total_pageviews, total_uniques]
    
    File.write(dst, JSON.stringify(stats))
  end
  
  def update
    update_ratings
    update_reporter
    update_stats
  end
  
  def update_stats
    endd = Time.now - DAY * 2
    
    
    r = report({"dimensions" => "ga:date", "metrics" => "ga:visits,ga:pageviews"}, endd - DAY * 90, endd, 90)
    stats = r.rows.map do |e|
      [
        Date.strptime(e[0], "%Y%m%d").to_time.to_i, # day
        e[1].to_i, # uniques
        e[2].to_i, # pageviews
      ]
    end
    total = r.totalsForAllResults
    stats.push({"total" => {"visits" => total["ga:visits"].to_i, "pageviews" => total["ga:pageviews"].to_i}})
    File.write(Config::VISITS_JSON, JSON.stringify(stats))
    
    
    r = report({"dimensions" => "ga:region", "metrics" => "ga:visits", "sort" => "-ga:visits"}, endd - DAY * 90, endd, 50)
    stats = r.rows.map do |e|
      [
        e[0].to_s, # city
        e[1].to_i, # pageviews
      ]
    end
    total = r.totalsForAllResults
    stats.push({"total" => {"visits" => total["ga:visits"].to_i}})
    File.write(Config::CITIES_JSON, JSON.stringify(stats))
    
    
    r = report({"dimensions" => "ga:browser,ga:browserVersion", "metrics" => "ga:visits", "sort" => "-ga:visits"}, endd - DAY * 30, endd, 1000)
    stats = r.rows.map do |e|
      [
        e[0].to_s, # browser name
        e[1].to_s, # version
        e[2].to_i, # uniques
      ]
    end
    total = r.totalsForAllResults
    stats.push({"total" => {"visits" => total["ga:visits"].to_i}})
    File.write(Config::BROWSERS_JSON, JSON.stringify(stats))
    
    
    r = report({"dimensions" => "ga:browser", "metrics" => "ga:visits", "sort" => "-ga:visits"}, endd - DAY * 30, endd, 100)
    stats = r.rows.map do |e|
      [
        e[0].to_s, # browser name
        e[1].to_i, # uniques
      ]
    end
    total = r.totalsForAllResults
    stats.push({"total" => {"visits" => total["ga:visits"].to_i}})
    File.write(Config::BROWSERSP_JSON, JSON.stringify(stats))
    
    
    r = report({"dimensions" => "ga:eventLabel,ga:browser,ga:browserVersion", "metrics" => "ga:uniqueEvents,ga:eventValue", "filters" => "ga:eventAction==error", "sort" => "-ga:uniqueEvents"}, endd - DAY * 30, endd, 500)
    stats = r.rows.map do |e|
      [
        e[0].to_s, # exception message
        e[1].to_s, # browser name
        e[2].to_s, # browser version
        e[3].to_i, # unique events
        e[4].to_i, # event value (errors before)
      ]
    end
    total = r.totalsForAllResults
    stats.push({"total" => {"uniqueEvents" => total["ga:uniqueEvents"].to_i}})
    File.write(Config::ERRORS_JSON, JSON.stringify(stats))
  end
  
  def update_ratings
    days = 10
    
    now = Time.new
    now -= (3 + days) * DAY
    
    seen = {}
    week = []
    
    days.times do
      
      start = now - DAY * 30
      endd = now
      views_stats, no, no = get_pageviews(start, endd)
      
      uniques = {}
      views_stats.each do |k, v|
        uniques[k] = v["uniques"]
      end
      
      names = uniques.keys
      names.sort! do |a, b|
        uniques[b] - uniques[a]
      end
      
      positions = {}
      names.each_with_index do |name, i|
        seen[name] = true
        positions[name] = i
      end
      
      week << positions
      
      now += DAY
    end
    
    
    res = Hash.new { |h, k| h[k] = [] }
    
    (0...days).each do |i|
      seen.keys.sort.each do |name|
        res[name][days - 1 - i] = (week[i][name] || 999998) + 1
      end
    end
    
    
    File.write(Config::HT_RATING_JSON, JSON.stringify(res))
  end
  
  def calc_month_borders year, month
    start = Time.new(year, month, 1)
    # jump to the next month (maybe year too)
    endd = start + 33 * DAY
    # jump to the fist second of the next month
    endd = Time.new(endd.year, endd.month, 1)
    # jump to the last second of current month
    endd = endd - 1
    # get the last day of the current month
    endd = Time.new(endd.year, endd.month, endd.day)
    return [start, endd]
  end
  
  def update_reporter
    # 25-26 month from the past
    now = Time.now
    cur = now - 27 * 30 * DAY
    last = nil
    while true
      cur += 25 * DAY
      if cur > now and (cur.month > now.month or cur.year > now.year)
        break
      end
      
      name = cur.month <= 9 ? "views-#{cur.year}-0#{cur.month}" : "views-#{cur.year}-#{cur.month}"
      if last == name
        next
      end
      last = name
      
      say "обновляю период «#{name}»"
      indent do
        cocktails_pageviews(name, *calc_month_borders(cur.year, cur.month))
      end
      @all << name
    end
    
    say "обновляю период «last-365-days»"
    indent do
      cocktails_pageviews("last-365-days", Time.now - (365 + 3) * DAY, Time.now - (0 + 3) * DAY)
    end
    @all << "last-365-days"
    
    say "обновляю период «last-30-days»"
    indent do
      cocktails_pageviews("last-30-days", Time.now - (30 + 3) * DAY, Time.now - (0 + 3) * DAY)
    end
    @all << "last-30-days"
    
    @all.reverse!
  end
  
  def flush_all_json
    File.open(Config::ALL_JSON, "w+") do |f|
      f.puts "{"
      rows = []
      @all.each do |name|
        rows << %Q{"#{name}": <!--# include virtual="#{name}.json" -->}
      end
      f.puts rows.join(",\n")
      f.puts "}"
    end
  end
  
  @@substitute =
  {
    "----_it" => "damn_it",
    "angel_s_----" => "angel_s_tits",
    "---_on_the_beach" => "bitch_on_the_beach",
    "safe_---_on_the_beach" => "safe_sex_on_the_beach",
    "---_on_the_beach_light" => "sex_on_the_beach_light",
    "innocent_---" => "innocent_sex"
  }
  
  def parse_pageviews data
    stats = Hash::new do |h, k|
      h[k] = Hash::new(0)
    end

    data.rows.each do |entry|
      
      path = entry[0]
      pv = entry[1].to_i
      upv = entry[2].to_i
      
      if upv > pv
        error "уникальных больше чем просмотров"
      end
      
      
      m = /\/cocktails?\/+([^\/.]+)/.match(path)
      unless m
        warning "не могу найти название коктейля в пути «#{path}»"
        next
      end
      path = m[1]
      
      if /---/.match(path)
        fixed = @@substitute[path]
        unless fixed
          error "изуродовано цензурой «#{path}»"
          next
        end
        path = fixed
      end
      
      cocktail = Cocktail.by_path(path)
      unless cocktail
        warning "не могу найти коктейль для пути «#{path}»"
        next
      end
      
      name = cocktail["name"]
      
      say "#{name}: #{pv} #{upv}"
      
      stats[name]["pageviews"] += pv
      stats[name]["uniques"] += upv
    end
    
    total_pageviews = data.totalsForAllResults["ga:pageviews"].to_i
    total_uniques = data.totalsForAllResults["ga:uniquePageviews"].to_i
    
    if total_pageviews < total_uniques
      error "всего просмотров меньше чем всего уникальных просмотров"
    end
    
    return stats, total_pageviews, total_uniques
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

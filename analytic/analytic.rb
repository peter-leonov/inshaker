#!/usr/bin/ruby
require 'rubygems'
require 'activesupport'
require 'rexml/document'
require 'unicode'
require 'curb'
require 'cgi'
include REXML
$KCODE = 'u'

# Скачивание и преобразование отчетов 
# Google Analytics в data.xml-файлы amCharts

class String
  def merge_i
    self.gsub(",", "").to_i
  end
end

module Config
  PERIOD = ARGV[0] ? ARGV[0].to_i : 30 # за какой период (дней до сегодняшнего) берем отчеты
  
  REPORTS_PATH = "reports/"
  
  VISITORS_REPORT = "VisitorsOverviewReport"
  CONTENT_REPORT  = "ContentReport"
  GEO_REPORT      = "GeoMapReport"
  
  OUT_VISITS = "../htdocs/stat/visitors/data.xml"
  OUT_CITIES = "../htdocs/stat/cities/data.xml"
  
  EMAIL    = "moscow@contactmaker.ru"
  PASSWORD = "fuck_world"
  PIE_COLORS = ["#a2bcda", "#c1b76f", "#f28358", "#edef00", "#24cbe5", "#64e572"]
end

def process_visits
  path_label = "AnalyticsReport/Report/Graph/Serie/Point/Label"
  path_value = "AnalyticsReport/Report/Graph/Serie/Point/Value"
  
  vxml = Document.new File.new(Config::REPORTS_PATH + Config::VISITORS_REPORT + ".xml")
  dates    = vxml.elements.to_a(path_label).map {|d| d = d.text}
  visitors = vxml.elements.to_a(path_value).map {|v| v = v.text.merge_i}
  
  cxml = Document.new File.new(Config::REPORTS_PATH + Config::CONTENT_REPORT + ".xml")
  views = cxml.elements.to_a(path_value).map {|v| v = v.text.merge_i}

  data_file = Document.new
  
  chart = Element.new("chart")
  data_file.add chart
  
  # X-Axis - даты
  series = Element.new("series")
  dates.each_with_index { |date, i|
    value = Element.new("value")
    value.attributes["xid"] = i.to_s
    value.text = date
    series.add value
  }
  chart.add_element series
  
  graphs = Element.new("graphs")
  chart.add_element graphs
  
  # Y-Axis - цифры
  [views, visitors].each_with_index { |set, i|
    graph = Element.new("graph")
    graph.attributes["gid"] = (i+1).to_s
    set.each_with_index { |num, j|
      value = Element.new("value")
      value.attributes["xid"] = j.to_s
      value.text = num
      graph.add value
    }
    graphs.add graph
  }
  
  # Запись в файл
  File.open(Config::OUT_VISITS, "w+") {|charts| data_file.write(charts) }
  puts "Built visits/visitors chart..."
end

def process_cities
  path_name  = "AnalyticsReport/Report/GeoMap/Region[position()<7]/Name"
  path_value = "AnalyticsReport/Report/GeoMap/Region[position()<7]/Value"
  
  cxml = Document.new File.new(Config::REPORTS_PATH + Config::GEO_REPORT + ".xml")
  cities = cxml.elements.to_a(path_name).map {|c| c = c.text}
  visitors =  cxml.elements.to_a(path_value).map {|v| v = v.text.merge_i}
  
  data_file = Document.new
  pie = Element.new("pie")
  
  data_file.add pie
  
  cities.each_with_index {|city, i|
    slice = Element.new("slice")
    slice.attributes["title"] = city
    if Config::PIE_COLORS[i] then slice.attributes["color"] = Config::PIE_COLORS[i] end
    slice.text = visitors[i].to_s
    pie.add slice
  }
  
  # Запись в файл
  File.open(Config::OUT_CITIES, "w+") {|pie| data_file.write(pie) }
  puts "Built cities chart..."
end

def get_cookies(header_str)
  cookies = {}
  headers = header_str.split("\n")
  headers.each {|h|
    if h =~ /Set-Cookie: (.+)/
      arr = $1.split("=")
      name = arr[0]
      cookies[name] = arr[1].split(";")[0]
    end
  }
  cstr = ""
  cookies.each {|name, val| cstr += name + "=" + CGI.escape(val) + ";" }
  cstr
end

def download_reports
  statuses = {} # статусы успешности скачивания
  
  dates = [(Config::PERIOD+1).days.ago, 1.days.ago].map {|d| d.strftime("%Y%m%d")}
  
  auth_url   = "https://www.google.com/accounts/ServiceLoginBoxAuth"
  report_pfx = "https://www.google.com/analytics/reporting/export?fmt=1&id=9038802&pdr=#{dates[0]}-#{dates[1]}&segkey=city&cmp=average&&rpt="
  
  serv  = Curl::PostField.content("service", "analytics")
  hl    = Curl::PostField.content("hl", "ru-RU")
  email = Curl::PostField.content("Email", Config::EMAIL)
  passw = Curl::PostField.content("Passwd", Config::PASSWORD)
  
  # Авторизация
  c = Curl::Easy.new(auth_url)
  c.http_post(serv, hl, email, passw)
  cstr = get_cookies(c.header_str)
  
  # Скачивание отчетов
  [Config::VISITORS_REPORT, Config::CONTENT_REPORT, Config::GEO_REPORT].each { |rpt|
    c = Curl::Easy.new(report_pfx + rpt)
    c.headers["Cookie"] = cstr
    c.http_get
    if c.body_str =~ /<\/AnalyticsReport>/
      puts "Downloaded "+ rpt + "..."
      File.open(Config::REPORTS_PATH + rpt + ".xml", "w+") {|out| out.write(c.body_str) }
      statuses[rpt] = true
    else
      warn "Failed to download " + rpt + "..." 
      statuses[rpt] = false
    end
  }
  statuses
end

FileUtils.mkpath([Config::REPORTS_PATH])
dates = [Config::PERIOD.days.ago, Time.now].map {|d| d.strftime("%d %B %Y")}
puts "Trying to download reports from #{dates[0]} to #{dates[1]}"
statuses = download_reports
if(statuses[Config::VISITORS_REPORT] && statuses[Config::CONTENT_REPORT]) then process_visits end
if(statuses[Config::GEO_REPORT]) then process_cities end

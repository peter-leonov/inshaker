#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require "barman"
require "rexml/document"
require "lib/fileutils"
require "credentials"


class AnalyticsProcessor < Barman::Processor
  include REXML
  
  module Config
    PERIOD = ARGV[0] ? ARGV[0].to_i : 30 # period (days up to today)
    
    HTDOCS_DIR    = Barman::HTDOCS_DIR
    VISITS_XML = HTDOCS_DIR + "/stat/visitors/data.xml"
    CITIES_XML = HTDOCS_DIR + "/stat/cities/data.xml"
  end
  
  def initialize
    super
  end
  
  def job_name
    "собиралку статистики"
  end
  
  def job
    authorize
    
    process_visits
    
    unless errors?
      write_data
    end
  end
  
  def authorize
    # auth_uri = "https://www.google.com/accounts/ClientLogin"
    # auth = `curl #{auth_uri} -s -d "accountType=GOOGLE" -d "Email=#{Config::EMAIL}" -d "Passwd=#{Config::PASSWORD}" -d "service=analytics" -d "source=inshaker-analytics-2"`
    
    auth_data = File.read('auth_data.txt')
    
    unless @auth_token = auth_data.split(/[\r\n]+/).find { |v| v =~ /^Auth=/ }
      raise "Authorization failed"
    end
  end
  

  def process_visits
    # visits_uri = "https://www.google.com/analytics/feeds/data?ids=ga:#{Config::PROFILE_ID}&dimensions=ga:date&metrics=ga:visits,ga:pageviews&start-date=2009-07-19&end-date=2009-10-19&prettyprint=true"
    # visits_data = `curl "#{visits_uri}" -s --header "Authorization: GoogleLogin #{auth_token}"`
    
    visits_data = File.read('visits_data.xml')
    
    
    v = REXML::Document.new(visits_data)
    dates   = v.elements.to_a("feed/entry/dxp:dimension[@name='ga:date']").map { |node| node.attributes["value"] }
    visits  = v.elements.to_a("feed/entry/dxp:metric[@name='ga:visits']").map { |node| node.attributes["value"] }
    views   = v.elements.to_a("feed/entry/dxp:metric[@name='ga:pageviews']").map { |node| node.attributes["value"] }
    
    @visits_doc = Document.new
    
    chart = Element.new("chart")
    @visits_doc.add chart
    
    # X-Axis - dates
    series = Element.new("series")
    dates.each_with_index do |date, i|
      value = Element.new("value")
      value.attributes["xid"] = i.to_s
      value.text = date
      series.add value
    end
    chart.add series
    
    graphs = Element.new("graphs")
    chart.add_element graphs
    
    # Y-Axis - digits
    [views, visits].each_with_index do |set, i|
      graph = Element.new("graph")
      graph.attributes["gid"] = (i + 1).to_s
      set.each_with_index do |num, j|
        value = Element.new("value")
        value.attributes["xid"] = j.to_s
        value.text = num
        graph.add value
      end
      graphs.add graph
    end
  end
  
  def write_data
    say "сохраняю преобразованную статистику"
    File.write(Config::VISITS_XML, @visits_doc)
  end
end

exit AnalyticsProcessor.new.run

# https://www.google.com/analytics/feeds/data?ids=ga%3A9038802&dimensions=ga%3Acity&metrics=ga%3Avisits&sort=-ga%3Avisits&start-date=2009-07-19&end-date=2009-10-19&max-results=10


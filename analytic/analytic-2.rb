#!/opt/ruby1.9/bin/ruby
require "rexml/document"
require "lib/fileutils"
require "credentials"

module Config
  PERIOD = ARGV[0] ? ARGV[0].to_i : 30 # period (days up to today)
end


# auth_uri = "https://www.google.com/accounts/ClientLogin"
# auth = `curl #{auth_uri} -s -d "accountType=GOOGLE" -d "Email=#{Config::EMAIL}" -d "Passwd=#{Config::PASSWORD}" -d "service=analytics" -d "source=inshaker-analytics-2"`

auth_data = File.read('auth_data.txt')

unless auth_token = auth_data.split(/[\r\n]+/).find { |v| v =~ /^Auth=/ }
  raise "Authorization failed"
end

# visits_uri = "https://www.google.com/analytics/feeds/data?ids=ga:#{Config::PROFILE_ID}&dimensions=ga:date&metrics=ga:visits,ga:pageviews&start-date=2009-07-19&end-date=2009-10-19&prettyprint=true"
# visits_data = `curl "#{visits_uri}" -s --header "Authorization: GoogleLogin #{auth_token}"`

visits_data = File.read('visits_data.xml')


v = REXML::Document.new(visits_data)
dates     = v.elements.to_a("feed/entry/dxp:dimension[@name='ga:date']").map { |node| node.attributes["value"] }
visits    = v.elements.to_a("feed/entry/dxp:metric[@name='ga:visits']").map { |node| node.attributes["value"] }
pageviews = v.elements.to_a("feed/entry/dxp:metric[@name='ga:pageviews']").map { |node| node.attributes["value"] }
puts pageviews

# https://www.google.com/analytics/feeds/data?ids=ga%3A9038802&dimensions=ga%3Acity&metrics=ga%3Avisits&sort=-ga%3Avisits&start-date=2009-07-19&end-date=2009-10-19&max-results=10


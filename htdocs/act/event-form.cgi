#!/usr/bin/env ruby

$main = "event@inshaker.ru,pl@contactmaker.ru"
$data_dir = "/www/inshaker/data/"

require "rubygems"
require "cgi"
require "csv"
require "/www/lib/ruby/pmc/rmail"

p = CGI.new.params

signature = "#{p["first"]} #{p["second"]} — #{p["event"]}, #{p["city"]}"


filter = {"first" => true, "second" => true, "city" => true, "email" => true, "event" => true}
names = ['Имя', 'Фамилия', 'Город', 'E-mail']
values = [p["first"], p["second"], p["city"], p["email"]]
human = ""

names.each_with_index do |v, i|
  human << %Q{<tr><th align="right">#{v}:</th><td>#{values[i]}</td></tr>\n}
end

p.keys.sort.each do |k|
  unless filter[k]
    v = p[k]
    names << k
    values << v
    human << %Q{<tr><th align="right">#{k}:</th><td>#{v}</td></tr>\n}
  end
end

row1 = names.map  { |v| "<th>#{v}</th>" }.join("")
row2 = values.map { |v| "<td>#{v}</td>" }.join("")

File.open("#{$data_dir}event-subscribers.csv", "a") do |f|
  CSV::Writer.generate(f) do |w|
    w << [Time.now.strftime("%Y-%m-%d %H:%M:%S"), p["event"], *values]
  end
end


html = %Q{
<h1>#{signature}</h1>
<br/>

<table border="0" cellpadding="3">#{human}</table>
<br/><br/>

<table border="1" cellspacing="0" cellpadding="2">
  <tr>#{row1}</tr>
  <tr>#{row2}</tr>
</table>
}


m = RMail::Message.bake :to => $main, :from => "#{p["first"]} #{p["second"]} <#{p["email"]}>", :subject => p["event"], :body => html
# m.send
# puts m
# puts html

print %Q[Content-type: application/json\n\n{"result": "OK", "id": 1}\n]

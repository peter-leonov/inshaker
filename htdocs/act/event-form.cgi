#!/usr/bin/env ruby

$main = "event@inshaker.ru"
$data_dir = "/www/inshaker/data/"

require "rubygems"
require "cgi"
require "csv"
require "rutils"
require "/www/inshaker/barman/lib/rmail"

p = CGI.new.params


filter = {"first" => true, "second" => true, "city" => true, "email" => true, "event" => true, "href" => true, "sent-message" => true}
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

fname  = p["href"].to_s.dirify.gsub(/[^a-zA-Z0-9\-]/, '')

FileUtils.mkdir_p($data_dir)
File.open("#{$data_dir}#{fname}.csv", "a") do |f|
  CSV::Writer.generate(f) do |w|
    w << [Time.now.strftime("%Y-%m-%d %H:%M:%S"), p["event"], *values]
  end
end


html = %Q{
<h1>#{p["first"]} #{p["second"]}, #{p["city"]}</h1>
<br/>

<table border="0" cellpadding="3">#{human}</table>
<br/><br/>

<table border="1" cellspacing="0" cellpadding="2">
  <tr>#{row1}</tr>
  <tr>#{row2}</tr>
</table>
}

who = "#{p["first"]} #{p["second"]} <#{p["email"]}>"
subject = "#{p["event"]} [#{p["city"]}]"

m = RMail::Message.bake :to => $main, :from => who, :subject => subject, :body => html
m.send

sent_message = p["sent-message"]
if sent_message
  m = RMail::Message.bake :to => who, :from => "Коктейльные события <#{$main}>", :subject => subject, :body => sent_message.to_s
  m.send
end

print %Q[Content-type: application/json\n\n{"result": "OK", "id": 1}\n]

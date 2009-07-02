#!/usr/bin/ruby

processors = []
if(ARGV.include?("all") || ARGV.empty?)
  processors = ['cocktails', 'ingredients', 'tools', 'bars', 'events','parties']
else processors = ARGV end

processors.each do |p|
  fork { exit(system("./processors/#{p}.rb") ? 0 : -1) }
  Process.wait
  puts "[#{p.capitalize} processor: #{($?.exitstatus == 0 ? 'OK' : 'FAILED')}]"
end

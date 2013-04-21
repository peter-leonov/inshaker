#!/usr/bin/env ruby
require 'find'
require 'oj'

Oj.default_options = {mode: :strict}
module Oj
  def self.parse str
    load str, {}
  end
  def self.stringify str
    dump str, {}
  end
end


def travers
  Find.find("/Users/peter/Desktop/db/").each do |path|
    m = %r{/(\w+)/bar\.json$}.match path
    next unless m
    node = m[1]
    key = 'bar'
    
    json = File.read(path)
    begin
      Oj.parse(json)
    rescue => e
      if json == ""
        {}
      else
        begin
          json.gsub! 'undefined', 'null'
          json.gsub! %r[}GET.*$]m, '}'
        rescue => e
        end
        
        begin
          Oj.parse(json)
        rescue => e
          puts "broken JSON in #{node}"
          puts json
          next
        end
      end
    end
  end
end


travers
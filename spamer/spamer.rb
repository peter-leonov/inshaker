#!/usr/bin/ruby

require 'rubygems'
require 'csv'
require '/www/inshaker/barman/lib/rmail_util'
require 'erb'

# render = ERB.new(File.read(ARGV[1]))
# renderer.result(bar_erb.get_binding)

class Person
  def self.init cols
    @@cols = cols
  end
  def initialize vals
    @@cols.each_with_index do |v, i|
      instance_variable_set("@#{v}", vals[i])
    end
  end
  def get_binding
    binding
  end
end

render = ERB.new(File.read(ARGV[1]).gsub("\r", ''))
csv = CSV.parse(File.read(ARGV[0]))
Person.init csv.shift

csv.each do |row|
  raw = render.result(Person.new(row).get_binding)
  
  message = {}
  head, body = raw.split(/\n\n/, 2)
  head.split(/\n/).each do |v|
    var, val = v.split(/: /, 2)
    message[var.downcase.to_sym] = val
  end
  message[:body] = body
  
  sleep 3
  
  puts message[:to]
  RMail::Message.bake(message).send
end


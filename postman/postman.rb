#!/usr/bin/ruby
require 'rubygems'
require 'lib/csv'
require 'lib/rmail'
require 'erb'

class Person
  def initialize hash
    hash.each do |k, v|
      instance_variable_set("@#{k}", v)
    end
  end
  def get_binding
    binding
  end
end

render = ERB.new(File.read(ARGV[0]).gsub("\r", ''))

CSV.foreach_hash(ARGV[1]) do |hash, line|
  raw = render.result(Person.new(hash).get_binding)
  message = {}
  head, body = raw.split(/\n\n/, 2)
  head.split(/\n/).each do |v|
    var, val = v.split(/: /, 2)
    message[var.downcase.to_sym] = val
  end
  message[:body] = body
  
  warn "#{line}: " + message[:to]
  RMail::Message.bake(message).send
  
  sleep 3
end
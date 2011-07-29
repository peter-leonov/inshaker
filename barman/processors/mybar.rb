#!/usr/bin/env ruby1.9
# encoding: utf-8
require "inshaker"
require "entities/tool"
require "find"

class MyBarProcessor < Inshaker::Processor
  
  module Config
    DB_DIR  = "/www/db"
  end
  
  def initialize
    super
  end
  
  def job_name
    "смешивалку моего бара"
  end
  
  def job
    update
    analyse
    
    unless errors?
      # something
    end
  end
  
  def update
    Process.fork do
      Dir.chdir(Config::DB_DIR)
      Process.exec("git", "pull")
    end
    
    unless Process.wait2[1].exitstatus == 0
      error "не удалось получить последнюю версию базы моих баров"
      return
    end
  end
  
  def analyse
    say "анализирую мои бары"
    
    Find.find(Config::DB_DIR) do |fname|
      m = fname.match(/\/([^\/]+)\/bar.json/)
      next unless m
      if /bar.json$/ =~ fname
        id = m[1]
        say id
        indent do
        process File.open(fname), id
        end # indent
      end
    end
  end
  
  def process f, id
    
    begin
      data = JSON.parse(f.read)
    rescue Exception => e
      warning "не могу разобрать данные из файла “#{f.path}”"
      return
    end
  end
end

exit MyBarProcessor.new.run
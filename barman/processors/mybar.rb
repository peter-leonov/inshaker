#!/usr/bin/env ruby1.9
# encoding: utf-8
require "inshaker"
require "entities/tool"

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
      Process.exec("git pull")
    end
    
    unless Process.wait2[1].exitstatus == 0
      error "не удалось получить последнюю версию базы моих баров"
      return
    end
  end
  
  def analyse
    say "анализирую мои бары"
  end
end

exit MyBarProcessor.new.run
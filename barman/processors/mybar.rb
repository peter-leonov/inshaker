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
    
  end
  
  def analyse
    say "анализирую мои бары"
  end
end

exit MyBarProcessor.new.run
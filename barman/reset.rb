#!/usr/bin/env ruby1.9
# encoding: utf-8
require 'inshaker'
require "lib/checker"

class ResetState < Inshaker::Processor
  module Config
    ROOT_DIR = Inshaker::ROOT_DIR
  end
  
  def job_name
    "сбрасывалку состояния"
  end
  
  def job
    
    system("git reset --hard")
    system("git clean -df")
    system("git fetch")
    system("git checkout -f toaster/master")
    system("git branch -f master")
    
    say "связность данных"
    Checker.init
    Checker.check
  end
end

exit ResetState.new.run
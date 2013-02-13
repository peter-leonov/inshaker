#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

require 'inshaker'
require "lib/checker"

class ResetState < Inshaker::Processor
  module GlobalConfig
    include Inshaker
    include Inshaker::Launcher
  end
  module Config
    ROOT_DIR = Inshaker::ROOT_DIR
  end
  
  def job_name
    "сбрасывалку состояния"
  end
  
  def job
    
    Dir.chdir("#{Config::ROOT_DIR}")
    
    if File.exists? GlobalConfig::LOCKPATH
      pid = File.read(GlobalConfig::LOCKPATH_PID)
      say "гашу предыдущий процесс (#{pid})"
      
      FileUtils.rmtree(GlobalConfig::LOCKPATH)
    end
    say "сбрасываю все изменения…"
    system("git fetch")
    system("git reset --hard git/master")
    system("git clean -fd")
    
    say "проверяю состояние…"
    system("git status")
    
    say "связность данных"
    Checker.init
    Checker.check
  end
end

exit ResetState.new.run
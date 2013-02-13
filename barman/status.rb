#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

require 'inshaker'
require "lib/checker"

class ViewStatus < Inshaker::Processor
  module Config
    ROOT_DIR = Inshaker::ROOT_DIR
  end
  
  def job_name
    "проверялку статуса"
  end
  
  def job
    say "что говорит git"
    system("git status")
    # system("git diff-files --name-only")
    
    say "какие процессы ruby запущены"
    system("ps -A -o pid,args | grep ruby")
    
    say "связность данных"
    Checker.init
    Checker.check
  end
end

exit ViewStatus.new.run
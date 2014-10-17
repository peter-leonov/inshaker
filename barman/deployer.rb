#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

require "inshaker"
require "lib/checker"

class Deployer < Inshaker::Processor
  module Config
    ROOT_DIR = Inshaker::ROOT_DIR
    
    module Launcher
      include Inshaker::Launcher
    end
  end
  
  def job_name
    "заливалку на сайт"
  end
  
  def job
    Checker.init
    Checker.check
    if errors?
      return 1
    end
    
    ok = true
    Config::Launcher::SCRIPTS.each do |k, v|
      error_path = Config::Launcher::SAVE_ERROR % k
      if File.exists?(error_path)
        ok = false
        login = File.read(error_path)
        
        error Config::Launcher::LOGIN_TO_ERRORED[login] + ": #{v[1]}"
      end
    end
    unless ok
      return
    end
    
    Dir.chdir(Config::ROOT_DIR)
    
    say "синхронизуюсь с сайтом…"
    unless system("git pull 2>&1")
      error "не удалось синхронизироваться с сайтом"
      return 2
    end
    
    if `git status` =~ /nothing to commit/
      warning "заливать нечего"
      return 3
    end
    
    say "сохраняю в гит…"
    unless system(%Q{git add . && git commit -am "content update" --author="#{user_author.quote}" >>inshaker.log 2>&1})
      error "не удалось сохранить обновления в гит"
      return 4
    end
    
    say "заливаю на сайт…"
    unless system("git push >>inshaker.log 2>&1")
      error "не удалось залить обновления на сайт"
      return 5
    end
    
    say "готово, проверяйте"
  end
end

exit Deployer.new.run
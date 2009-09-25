#!/usr/bin/ruby
require 'barman'

class Deployer < Barman::Processor
  module Config
    BASE_DIR    = Barman::HTDOCS_DIR
  end
  
  def job
    unless system("cd #{Config::BASE_DIR} && git commit1 -am 'content update' 2>&1")
      error "не могу сохранить обновления в гит"
    else
      unless system("cd #{Config::BASE_DIR} && git push1 2>&1")
        error "не могу залить обновления на сайт"
      else
        say "все сохранил и залил на сайт"
      end
    end
  end
end

exit Deployer.new.run
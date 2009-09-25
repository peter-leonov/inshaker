#!/usr/bin/ruby
require 'barman'

class Deployer < Barman::Processor
  module Config
    BASE_DIR    = Barman::HTDOCS_DIR
  end
  
  def job
    Dir.chdir(Config::BASE_DIR)
    unless system("git pull")
      error "не удалось синхронизироваться с сайтом"
    else
      if `git status` =~ /nothing to commit/
        say "заливать нечего"
      else
        say "начинаем процедуру…"
        unless system("git commit -am 'content update'")
          error "не удалось сохранить обновления в гит"
        else
          unless system("git push")
            error "не удалось залить обновления на сайт"
          else
            say "все сохранил и залил на сайт"
          end
        end
      end
    end
  end
end

exit Deployer.new.run
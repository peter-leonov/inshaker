#!/usr/bin/ruby
require 'barman'

class Deployer < Barman::Processor
  module Config
    BASE_DIR    = Barman::HTDOCS_DIR
  end
  
  def job
    Dir.chdir(Config::BASE_DIR)
    unless system("git pull >>barman.log 2>&1")
      error "не удалось синхронизироваться с сайтом"
    else
      if `git status` =~ /nothing to commit/
        say "заливать нечего"
      else
        say "сохраняю в гит…"
        unless system("git commit -am 'content update' >>barman.log 2>&1")
          error "не удалось сохранить обновления в гит"
        else
          say "заливаю на сайт…"
          unless system("git push >>barman.log 2>&1")
            error "не удалось залить обновления на сайт"
          else
            say "готово, проверяйте сайт"
          end
        end
      end
    end
  end
end

exit Deployer.new.run
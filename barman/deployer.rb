#!/usr/bin/ruby
require 'barman'

class Deployer < Barman::Processor
  module Config
    ROOT_DIR = Barman::ROOT_DIR
  end
  
  def job
    # puts ENV["X_FORWARDED_FOR"]
    Dir.chdir(Config::ROOT_DIR)
    say "синхронизуюсь с сайтом…"
    unless system("git pull >>barman.log 2>&1")
      error "не удалось синхронизироваться с сайтом"
    else
      if `git status` =~ /nothing to commit/
        warning "заливать нечего"
      else
        say "сохраняю в гит…"
        unless system("git commit -am 'content update' >>barman.log 2>&1")
          error "не удалось сохранить обновления в гит"
        else
          say "заливаю на сайт…"
          unless system("git push >>barman.log 2>&1")
            error "не удалось залить обновления на сайт"
          else
            say "готово — проверяйте"
          end
        end
      end
    end
  end
end

exit Deployer.new.run
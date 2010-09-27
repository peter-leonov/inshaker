#!/usr/bin/ruby
require 'inshaker'

class Deployer < Barman::Processor
  module Config
    ROOT_DIR = Barman::ROOT_DIR
  end
  
  def job_name
    "заливалку на сайт"
  end
  
  def job
    Dir.chdir(Config::ROOT_DIR)
    say "синхронизуюсь с сайтом…"
    unless system("git pull 2>&1")
      error "не удалось синхронизироваться с сайтом"
    else
      if `git status` =~ /nothing to commit/
        warning "заливать нечего"
      else
        author = login_to_author(user_login)
        say "сохраняю в гит…"
        unless system(%Q{git add . && git commit -am "content update" --author="#{author.quote}" >>inshaker.log 2>&1})
          error "не удалось сохранить обновления в гит"
        else
          say "заливаю на сайт…"
          unless system("git push >>inshaker.log 2>&1")
            error "не удалось залить обновления на сайт"
          else
            say "готово, проверяйте"
          end
        end
      end
    end
  end
end

exit Deployer.new.run
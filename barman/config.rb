# encoding: utf-8

module Inshaker
  DOMAIN        = "www.inshaker.ru"
  ROOT_DIR      = "/www/inshaker/"
  BASE_DIR      = ENV['INSHAKER_BASE_DIR'] || "/home/www/inshaker-base/"
  LOCK_FILE     = ".lock-barman"
  
  TEMPLATES_DIR = ROOT_DIR + "barman/templates/"
  HTDOCS_DIR    = ROOT_DIR + "htdocs/"
  HT_DB_DIR     = ROOT_DIR + "htdocs/db/"
  
  module Launcher
    LOCKPATH = "#{ROOT_DIR}/#{LOCK_FILE}"
    LOCKPATH_LOGIN = "#{LOCKPATH}/login"
    SAVE_ERROR = "#{ROOT_DIR}/error-in-processor.%s"
    
    SCRIPTS =
    {
      "cocktails" => ["./processors/cocktails.rb", "Коктейли"],
      "ingredients" => ["./processors/ingredients.rb", "Ингредиенты"],
      "marks" => ["./processors/marks.rb", "Марки"],
      "bars" => ["./processors/bars.rb", "Бары"],
      "events" => ["./processors/events.rb", "События"],
      "barmen" => ["./processors/barmen.rb", "Барменов"],
      "goods" => ["./processors/goods.rb", "Покупки"],
      "magazine" => ["./processors/magazine.rb", "Журнал"],
      "blog" => ["./processors/blog.rb", "Блог"],
      "blog-banners" => ["./processors/blog-banners.rb", "Баннеры в Блоге"],
      "mybar" => ["./processors/mybar.rb", "Мой бар"],
      
      "analytics" => ["./processors/analytics.rb", "Аналитика"],
      "stats" => ["./processors/stats.rb", "Статистика"],
      
      "deployer" => ["./deployer.rb", "Заливалку"],
      "status" => ["./status.rb", "Статус"],
      "reset" => ["./reset.rb", "Сброс"]
    }
    
    LOGIN_TO_BUSY =
    {
      "mike" => "занял Мишенька",
      "max" => "занял Максимка",
      "viola" => "заняла Виолочка",
      "anya" => "заняла Анечка",
      "peter" => "занял Петечка",
      "barman" => "занял Бармен",
      "worker" => "занял Рабочий"
    }
    LOGIN_TO_BUSY.default = "заняло НЛО"
    
    LOGIN_TO_ERRORED =
    {
      "mike" => "Мишенька неудачно смешал",
      "max" => "Максимка неудачно смешал",
      "viola" => "Виолочка неудачно смешала",
      "anya" => "Анечка неудачно смешала",
      "peter" => "Петечка неудачно смешал",
      "barman" => "Бармен неудачно смешал",
      "worker" => "Рабочий неудачно смешал"
    }
    LOGIN_TO_ERRORED.default = "НЛО неудачно смешало"

    LOGIN_TO_AUTHOR =
    {
      "mike" => "Mikhail Vikhman <mike@inshaker.ru>",
      "max" => "Maxim Dergilev <max@inshaker.ru>",
      "viola" => "Viola Kostina <viola@inshaker.ru>",
      "anya" => "Anna Baturina <anya@inshaker.ru>",
      "peter" => "Peter Leonov <pl@inshaker.ru>",
      "barman" => "Barman <barman@inshaker.ru>",
      "worker" => "Worker <pl+worker@inshaker.ru>"
    }
    LOGIN_TO_AUTHOR.default = "UFO <ufo@inshaker.ru>"
  end
  
end

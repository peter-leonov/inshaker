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
    LOCKPATH_PID = "#{LOCKPATH}/pid"
    SAVE_ERROR = "#{ROOT_DIR}/error-in-processor.%s"
    
    SCRIPTS =
    {
      "cocktails" => {script: "./processors/cocktails.rb", name: "Коктейли"},
      "ingredients" => {script: "./processors/ingredients.rb", name: "Ингредиенты"},
      "marks" => {script: "./processors/marks.rb", name: "Марки"},
      "bars" => {script: "./processors/bars.rb", name: "Бары"},
      "events" => {script: "./processors/events.rb", name: "События"},
      "barmen" => {script: "./processors/barmen.rb", name: "Барменов"},
      "goods" => {script: "./processors/goods.rb", name: "Покупки"},
      "mybar" => {script: "./processors/mybar.rb", name: "Мой бар"},
      "groups" => {script: "./processors/groups.rb", name: "Группы коктейлей"},
      "branding" => {script: "./processors/branding.rb", name: "Брендинг"},
      
      "analytics" => {script: "./processors/analytics.rb", name: "Аналитика"},
      
      "deployer" => {script: "./deployer.rb", name: "Заливалку"},
      "status" => {script: "./status.rb", name: "Статус", nolock: true},
      "reset" => {script: "./reset.rb", name: "Сброс", nolock: true}
    }
    
    LOGIN_TO_BUSY =
    {
      "mike" => "занял Мишенька",
      "max" => "занял Максимка",
      "viola" => "заняла Виолочка",
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
      "peter" => "Peter Leonov <pl@inshaker.ru>",
      "barman" => "Barman <barman@inshaker.ru>",
      "worker" => "Worker <pl+worker@inshaker.ru>"
    }
    LOGIN_TO_AUTHOR.default = "UFO <ufo@inshaker.ru>"
  end
  
end

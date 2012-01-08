# encoding: utf-8

module Inshaker
  DOMAIN        = "www.inshaker.ru"
  ROOT_DIR      = "/www/inshaker/"
  BASE_DIR      = ENV['INSHAKER_BASE_DIR'] || "/base/inshaker/"
  LOCK_FILE     = ".lock-barman"
  
  TEMPLATES_DIR = ROOT_DIR + "barman/templates/"
  HTDOCS_DIR    = ROOT_DIR + "htdocs/"
  HT_DB_DIR     = ROOT_DIR + "htdocs/db/"
end

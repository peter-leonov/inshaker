# encoding: utf-8

module Inshaker
  DOMAIN        = "www.inshaker.ru"
  ROOT_DIR      = "/www/inshaker/"
  BASE_DIR      = ENV['INSHAKER_BASE_DIR'] || (ROOT_DIR + "barman/base/")
  LOCK_FILE     = ".lock-barman"
  
  TEMPLATES_DIR = ROOT_DIR + "barman/templates/"
  HTDOCS_DIR    = ROOT_DIR + "htdocs/"
end

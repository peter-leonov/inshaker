# encoding: utf-8
class Barman
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Barmen/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "barman/"
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    SITEMAP_LINKS  = HT_ROOT + "sitemap.txt"
    
    DB_JS          = Inshaker::HTDOCS_DIR + "db/barmen.js"
    COCKTAILS_DB   = Inshaker::HTDOCS_DIR + "db/cocktails.js"
    
    TEMPLATE       = Inshaker::TEMPLATES_DIR + "barman.rhtml"
  end
end
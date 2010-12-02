# encoding: utf-8
class Mark < Inshaker::Entity
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Marks/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "mark/"
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    
    DB_JS          = Inshaker::HTDOCS_DIR + "db/ingredients/marks.json"
  end
end

# encoding: utf-8
class Tool < Inshaker::Entity
  module Config
    TOOLS_DIR  = Inshaker::BASE_DIR + "Tools" 
    HTDOCS_DIR = Inshaker::HTDOCS_DIR
    
    TOOLS_ROOT = HTDOCS_DIR + "i/merchandise/tools/"
    DB_JS      = HTDOCS_DIR + "db/tools/tools.json"
  end
  
  def self.init
    return if @inited
    @inited = true
    
    @db = []
    @by_name = {}
    
    if File.exists?(Config::DB_JS)
      @db = JSON.parse(File.read(Config::DB_JS))
      @by_name = @db.hash_index("name")
    end
  end
  
  def self.check_integrity
    say "проверяю связность данных штучек"
  end
  
end

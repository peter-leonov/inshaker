# encoding: utf-8
require 'sqlite3'
require 'digest/md5'

class Storage
  module Config
    ROOT = File.dirname(__FILE__)
    throw "need absolute path" unless ROOT[0] == '/'

    DB_PATH = ROOT + '/storage.sqlite3'
    SALT = ENV['INSHAKER_STORAGE_SALT']
  end
  
  def initialize
    @salt = Config::SALT
    @db = SQLite3::Database.new Config::DB_PATH
    
    @db.execute_batch <<-SQL
      BEGIN;
      
      CREATE TABLE IF NOT EXISTS Nodes
      (
        id       INTEGER PRIMARY KEY,
        created  INTEGER,
        modified INTEGER,
        node     TEXT,
        key      TEXT,
        json     TEXT
      );

      CREATE INDEX IF NOT EXISTS node_with_key ON Nodes(node, key);

      COMMIT;
    SQL
    
    @create_stmt = @db.prepare "INSERT INTO Nodes(created, modified, node, key, json) VALUES(:created, :modified, :node, :key, :json)"
    @update_stmt = @db.prepare "UPDATE Nodes SET modified = :modified, json = :json WHERE node = :node AND key = :key"
    @get_stmt = @db.prepare "SELECT json FROM Nodes WHERE node = :node AND key = :key"
  end
  
  def process env
    uri = env["REQUEST_URI"]
    tempfile = env["HTTP_TEMPORARY_FILE"]
    
    x, action, hash, id = uri.split("/")
    
    if action == "create" && tempfile
      id = Digest::MD5.hexdigest(rand.to_s + Time.now.to_s).to_s
      
      path = Config::DB + "/#{id[0]}/#{id[1]}/#{id}"
      unless FileUtils.mkdir_p(path)
        return [
          500,
          {"Content-Type" => "application/json"},
          [%Q{{"error":"“bar” is already exists"}}]
        ]
      end
      FileUtils.move(tempfile, path + "/bar.json")
      
      return [
        200,
        {"Content-Type" => "application/json"},
        [%Q{{"id":"#{id}","hash":"#{Digest::MD5.hexdigest(id + @salt)}"}}]
      ]
    end
    
    if action == "save" and !tempfile.nil?
      path = Config::DB + "/#{id[0]}/#{id[1]}/#{id}"
      unless FileTest::directory?(path)
        return [
          404,
          {"Content-Type" => "application/json"},
          [%Q{{"error":"“bar” does not exist"}}]
        ]
      end
      FileUtils.move(tempfile, path + "/bar.json")
      return [
        200,
        {"Content-Type" => "application/json"},
        [%Q{true}]
      ]
    end
    
    return [
      404,
      {"Content-Type" => "application/json"},
      [%Q{{"error":"unknown action “#{action}”"}}]
    ]
  end
end

app = Storage.new
run proc {|env| app.process env }

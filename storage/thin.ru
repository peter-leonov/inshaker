# encoding: utf-8
require 'sqlite3'
require 'digest/md5'

class Storage
  module Config
    ROOT = File.dirname(__FILE__)
    throw "need absolute path" unless ROOT[0] == '/'

    DB_PATH = ROOT + '/db/storage.sqlite3'
    SALT = File.read(ROOT + '/salt.txt')
    throw "need salt" if SALT.nil?
  end
  
  def initialize
    @salt = Config::SALT
    @db = SQLite3::Database.new Config::DB_PATH
    @db.results_as_hash = true
    
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
    
    x, action, hash, id = uri.split("/")
    
    if action == "create"
      id = Digest::MD5.hexdigest(rand.to_s + Time.now.to_s).to_s
      
      now = Time.now.to_i
      begin
        @create_stmt.execute created: now, modified: now, node: id, key: 'bar', json: env["rack.input"].read
      rescue => e
        return [
          500,
          {"Content-Type" => "text/plain"},
          [e.message]
        ]
      end
      
      return [
        200,
        {"Content-Type" => "application/json"},
        [%Q{{"id":"#{id}","hash":"#{Digest::MD5.hexdigest(id + @salt)}"}}]
      ]
    end
    
    if action == "save"
      unless Digest::MD5.hexdigest(id + @salt) == hash
        return [
          403,
          {"Content-Type" => "application/json"},
          [%Q{{"error":"hash missmatch"}}]
        ]
      end
      
      now = Time.now.to_i
      begin
        @update_stmt.execute modified: now, node: id, key: 'bar', json: env["rack.input"].read
      rescue => e
        return [
          404,
          {"Content-Type" => "application/json"},
          [%Q{{"error":"“bar” does not exist"}}]
        ]
      end
      
      return [
        200,
        {"Content-Type" => "application/json"},
        [%Q{true}]
      ]
    end
    
    if action == "get"
      id = hash
      begin
        @get_stmt.execute node: id, key: 'bar' do |result|
          return [
            200,
            {"Content-Type" => "application/json"},
            [result.next['json']]
          ]
        end
      rescue => e
        return [
          404,
          {"Content-Type" => "application/json"},
          [%Q{{"error":"“bar” does not exist"}}]
        ]
      end
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

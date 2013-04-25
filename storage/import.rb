#!/usr/bin/env ruby
require 'find'
require 'oj'
require 'sqlite3'

Oj.default_options = {mode: :strict}
module Oj
  def self.parse str
    load str, {}
  end
  def self.stringify str
    dump str, {}
  end
end

class Import
  module Config
    REPO_PATH = "/Users/peter/Desktop/db/"
  end
  
  def job
    connect
    count
    import
    disconnect
  end
  
  def connect
    @db = SQLite3::Database.new 'storage.sqlite3'
    
    @db.execute_batch <<-SQL
      BEGIN;
      
      DROP TABLE IF EXISTS Nodes;
      
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
    
    @insert_stmt = @db.prepare "INSERT INTO Nodes(node, key, json) VALUES(:node, :key, :json)"
  end
  
  def disconnect
    @insert_stmt.close
    @db.close
  end
  
  def traverse
    Find.find(Config::REPO_PATH).each do |path|
      m = %r{/(\w+)/bar\.json$}.match path
      next unless m
      node = m[1]
      key = 'bar'
      
      yield path, node, key
    end
  end
  
  def count
    print "calculating nodes count..."
    count = 0
    traverse do
      count += 1
    end
    @count = count
    puts " #{count}"
  end
  
  def import
    count = 0
    traverse do |path, node, key|
      json = File.read(path)
      begin
        Oj.parse(json)
      rescue => e
        if json == ""
          {}
        else
          begin
            json.gsub! 'undefined', 'null'
            json.gsub! %r[}GET.*$]m, '}'
          rescue => e
            puts "broken JSON in #{node}"
            next
          end
        
          begin
            Oj.parse(json)
          rescue => e
            puts "broken JSON in #{node}"
            puts json
            next
          end
        end
      end
      
      @insert_stmt.execute(node: node, key: key, json: json)
      
      count += 1
      puts "#{count}: #{count * 100 / @count}%" if count % 1000 == 0
    end
  end
end

Import.new.job


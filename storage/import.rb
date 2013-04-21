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
  
  def initialize
    @db = SQLite3::Database.new 'storage.sqlite3'
    
    @db.execute <<-SQL
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
    
    @insert_stmt = @db.prepare( "INSERT INTO Nodes(node, key, json) VALUES(:node, :key, :json)" )
  end

  def traverse
    Find.find(Config::REPO_PATH).each do |path|
      m = %r{/(\w+)/bar\.json$}.match path
      next unless m
      node = m[1]
      key = 'bar'
    
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
    
      @insert_stmt.execute node: node, key: key, json: json
    end
  end
end

Import.new.traverse
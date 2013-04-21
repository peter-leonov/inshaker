# encoding: utf-8
require "fileutils"
require "digest/md5"

class Storage
  module Config
    ROOT = "/www/storage"
    DB   = "#{ROOT}/db"
  end
  
  def self.init
    @@salt = /"(.+)"/.match(File.read(Config::ROOT + "/salt.conf"))[1]
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
        [%Q{{"id":"#{id}","hash":"#{Digest::MD5.hexdigest(id + @@salt)}"}}]
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

Storage.init
app = Storage.new
run proc {|env| app.process env }

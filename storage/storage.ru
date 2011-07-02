require "fileutils"
require "digest/md5"

class Storage
  module Config
    ROOT = "/www/inshaker/storage"
    DB   = "#{ROOT}/db"
  end
  
  def process env
    uri = env["REQUEST_URI"]
    tempfile = env["HTTP_TEMPORARY_FILE"]

    salt = /"(.+)"/.match(File.read("/www/inshaker/storage/salt.conf"))[1]

    x, action, hash, id = uri.split("/")

    if action == "createbar" && tempfile
      id = Digest::MD5.hexdigest(rand.to_s + Time.now.to_s).to_s

      path = Config::DB + '/' + id
      unless Dir.mkdir(path)
        return [
          500,
          {"Content-Type" => "application/json"},
          [%Q{{"error":"bar is already exists"}}]
        ]
      end
      FileUtils.move(tempfile, path + "/bar.json")

      return [
        200,
        {"Content-Type" => "application/json"},
        [%Q{{"id":"#{id}","hash":"#{Digest::MD5.hexdigest(id + salt)}"}}]
      ]
    end

    if action == "savebar" and !tempfile.nil?
      path = Config::DB + '/' + id
      unless FileTest::directory?(path)
        return [
          500,
          {"Content-Type" => "application/json"},
          [%Q{{"error":"bar does not exist"}}]
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

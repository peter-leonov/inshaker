require "fileutils"
require "digest/md5"

app = proc do |env|
  
  uri = env["REQUEST_URI"]
  tempfile = env["HTTP_TEMPORARY_FILE"]
  path_to_dir = "/www/inshaker/storage/db/"
  salt = /"(.+)"/.match(File.read("/www/inshaker/storage/salt.conf"))[1]
  
  action, hash, id = uri.split("/")
  
  if action == "createbar" && tempfile
    id = Digest::MD5.hexdigest(rand.to_s + Time.now.to_s).to_s
    
    directory_name = path_to_dir + id
    unless Dir.mkdir(directory_name)
      return [
        500,
        {"Content-Type" => "application/json"},
        [%Q{{"error":"bar is already exists"}}]
      ]
    end
    FileUtils.move(tempfile, directory_name + "/bar.json")
    
    return [
      200,
      {"Content-Type" => "application/json"},
      [%Q{{"id":"#{id}","hash":"#{Digest::MD5.hexdigest(id + salt)}"}}]
    ]
  end
  
  if action == "savebar" and !tempfile.nil?
    directory_name = path_to_dir + id
    unless FileTest::directory?(directory_name)
      return [
        500,
        {"Content-Type" => "application/json"},
        [%Q{{"error":"bar does not exist"}}]
      ]
    end
    FileUtils.move(tempfile, directory_name + "/bar.json")
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

run app

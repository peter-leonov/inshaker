#!/usr/bin/env ruby1.9
# encoding: utf-8

# CGI-specific stuff
# redirect all output to stdout and make it unbuferred
$stdout.sync = true
$stderr.reopen($stdout)
puts "Content-type: text/plain; charset=utf-8\n\n"

require "config"
require "base64"

class Launcher
  
  module Config
    include Inshaker
    
    include Inshaker::Launcher
  end
  
  def initialize
    @user_login = get_user_login
    unless @user_login
      puts "unauthorized access"
      exit 1
    end
    @user_busy = Config::LOGIN_TO_BUSY[@user_login]
    @user_author = Config::LOGIN_TO_AUTHOR[@user_login]
  end
  
  def launch
    
    params = parse_params
    
    processors = {}
    params.each do |k, v|
      script = Config::SCRIPTS[k]
      unless script
        puts "Ошибка: неизвестное действие #{k}."
        exit 1
      end
      processors[k] = script
    end
    
    if processors.empty?
      puts "Ошибка: нечего запускать."
      exit 1
    end
    
    run processors
  end
  
  def lock
    
    if File.directory?(Config::LOCKPATH)
      
      busy = Config::LOGIN_TO_BUSY[File.read(Config::LOCKPATH_LOGIN)]
      puts %Q{<h2 class="warning">Бармена #{busy}.<h2>}
      
      return false
    end
    
    Dir.mkdir(Config::LOCKPATH)
    File.write(Config::LOCKPATH_LOGIN, @user_login)
    
    return true
  end
  
  def unlock
    
    unless File.directory?(Config::LOCKPATH)
      return false
    end
    
    File.unlink(Config::LOCKPATH_LOGIN)
    Dir.rmdir(Config::LOCKPATH)
    
    return true
  end
  
  def run jobs
    Dir.chdir("#{Config::ROOT_DIR}barman/")
    
    ENV["INSHAKER_USER_AUTHOR"] = @user_author
    
    unless lock
      exit 1
    end
    jobs.each do |k, job|
      puts "Запускаю «#{job[1]}»…"
      pid = fork { exec job[0] }
      Process.wait pid
      
      unless k == "deployer"
        error_file = Config::SAVE_ERROR % k
        if $?.exitstatus == 0
          File.unlink(error_file) if File.exists?(error_file)
        else
          File.write(error_file, @user_login)
        end
      end
    end
    unlock
  end
  
  def parse_params
    body = $stdin.read(ENV["CONTENT_LENGTH"].to_i)
    
    # super light parser for url-encoded parameters
    hash = {}
    body.split(/[&;]/).each do |pair|
      k, v = pair.split(/\=/)
      hash[k] = v
    end
    
    return hash
  end
  
  def get_user_login
    if auth = ENV["HTTP_AUTHORIZATION"].to_s.match(/Basic (.+)/)
      Base64.decode64(auth[1]).split(':')[0]
    else
      nil
    end
  end
  
end

class File
  def self.write file, data
    open(file, 'w') do |f|
      f.write data
    end
  end
end

Launcher.new.launch

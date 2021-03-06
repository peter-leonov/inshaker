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
  
  def launch
    
    unless authorize
      puts %Q{Unauthorized access.}
      return false
    end
    
    params = parse_params
    
    unless params
      puts %Q{No input parameters passed.}
      return false
    end
    
    
    @job_name = params["job"]
    @job = Config::SCRIPTS[@job_name]
    
    unless @job
      puts %Q{Unknown job "#{@job_name}"}
      return false
    end
    
    run
  end
  
  def run
    unless lock
      puts %Q{Failed to lock}
      return false
    end
    
    begin
      job
    ensure
      unlock
    end
  end
  
  def job
    Dir.chdir("#{Config::ROOT_DIR}/barman/")
    
    $stdout.reopen("job.log", "a")
    
    reset
    
    pid = fork { exec @job[:script] }
    Process.wait pid
    
    if $?.exitstatus == 0
      warn %Q{Job “#{@job[:name]}” succeeded.}
      commit
    else
      warn %Q{Job “#{@job[:name]}” failed!}
      reset
    end
  end
  
  def commit
    puts %Q{Commiting…}
    
    # system(%Q{git status; git diff})
    system(%Q{git add . && git commit -am "job done: #{@job_name}" --author="#{@user_author}" && git push})
  end
  
  def reset
    puts %Q{Resetting…}
    
    system(%Q{git fetch && git reset --hard origin/master})
    system(%Q{git clean -df; git status})
  end
  
  def lock
    begin
      Dir.mkdir(Config::LOCKPATH)
    rescue Exception => e
      return false
    end
    
    true
  end
  
  def unlock
    Dir.rmdir(Config::LOCKPATH)
  end
  
  def parse_params
    body = $stdin.read(ENV["CONTENT_LENGTH"].to_i)
    
    unless body
      return nil
    end
    
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
  
  def authorize
    @user_login = get_user_login
    unless @user_login
      return false
    end
    @user_author = Config::LOGIN_TO_AUTHOR[@user_login]
    true
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

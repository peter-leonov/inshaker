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
    
    params = parse_params
    
    unless params
      puts %Q{No input parameters passed.}
      return
    end
    
    
    job_name = params["job"]
    job = Config::SCRIPTS[job_name]
    
    unless job
      puts %Q{Unknown job "#{job_name}"}
      return false
    end
    
    run job
  end
  
  def run job
    Dir.chdir("#{Config::ROOT_DIR}/barman/")
    
    unless lock
      puts %Q{Failed to lock}
      return false
    end
    
    pid = fork { exec job[0] }
    Process.wait pid
    
    if $?.exitstatus == 0
      # TODO
    end
    
    unlock
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
  
end

class File
  def self.write file, data
    open(file, 'w') do |f|
      f.write data
    end
  end
end

Launcher.new.launch

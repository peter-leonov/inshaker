#!/usr/bin/ruby
require 'barman'

class Deployer
  
  module Config
    BASE_DIR    = Barman::HTDOCS_DIR
    DEPLOY_DIRS = ["bars", "cocktails", "i", "events", "v"]
  end
  
  def initialize
     @excl = [".", "..", ".svn", ".TemporaryItems", ".DS_Store"]
     svn_add
     svn_commit
     svn_update
  end
  
  def svn_add
    Config::DEPLOY_DIRS.each do |deploy_dir|
      svn_add_recursively Config::BASE_DIR + deploy_dir
    end
  end
  
  def svn_commit
    begin
      system("cd #{Config::BASE_DIR} && svn ci -m 'content updated from WEB on #{Time.now}'")
    rescue
      puts "Unable to perform svn commit"
      exit 1
    end
  end
  
  def svn_update
    begin
      puts "Connecting to inshaker.ru..."
      system("ssh root@inshaker.ru 'cd /www && sudo -u www svn up 2>&1 | grep revision'")
    rescue
      puts "Unable to perform svn update on server"
      exit 1
    end
  end

private

  def svn_add_recursively dir
    d = Dir.new(dir)
    system("svn add #{d.path} 2>&1 | grep '[AM]      '")
    system("svn add #{d.path}/* 2>&1 | grep '[AM]      '")
    
    d.each do |file|
      if !@excl.include?(file)
        if File.ftype("#{d.path}/#{file}") == "directory"
          system("svn add #{d.path}/#{file}/* 2>&1 | grep '[AM]      '")
          svn_add_recursively "#{d.path}/#{file}"
        end
      end
    end
  end
  
end

Deployer.new

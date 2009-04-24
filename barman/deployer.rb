#!/usr/bin/ruby
require 'barman'

class Deployer
  
  module Config
    BASE_DIR    = Barman::HTDOCS_DIR
    DEPLOY_DIRS = ["bars", "cocktails", "i", "events", "v"]
  end
  
  def initialize
     git_add_all
     git_commit_and_push
  end
  
  def git_add_all
    Config::DEPLOY_DIRS.each do |deploy_dir|
      git_add Config::BASE_DIR + deploy_dir
    end
  end
  
  def git_commit_and_push
    begin
      system("cd #{Config::BASE_DIR} && git commit -a -m 'content updated from WEB on #{Time.now}' 2>&1 && git push")
    rescue
      puts "Unable to perform git commit and push"
      exit 1
    end
  end
  
private

  def git_add dir
    d = Dir.new(dir)
    system("git add #{d.path} 2>&1")
  end
  
end

Deployer.new

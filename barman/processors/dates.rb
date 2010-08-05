#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require "barman"

class Processor < Barman::Processor

  def job_name
    "угадывалку дат"
  end
  
  def job
    
    commits = `git log --format=oneline`.scan(/^\w+/).reverse
    
    
    
    p commits
    
  end
end

exit Processor.new.run
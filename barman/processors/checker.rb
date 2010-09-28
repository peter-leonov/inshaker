#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require "inshaker"
require "entities/cocktail"
require "entities/barman"
require "entities/bar"


class IntegrityProcessor < Inshaker::Processor

  def job_name
    "проверялку всецелостности"
  end
  
  def job
    Cocktail.init
    Barman.init
    Bar.init
    
    Cocktail.check_integrity
    Barman.check_integrity
    Bar.check_integrity
  end
end 

exit IntegrityProcessor.new.run
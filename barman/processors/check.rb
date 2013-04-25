#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
$:.push('/www/inshaker/barman')

require "inshaker"
require "lib/checker"


class IntegrityProcessor < Inshaker::Processor

  def job_name
    "проверялку всецелостности"
  end
  
  def job
    Checker.init
    Checker.check
  end
end 

exit IntegrityProcessor.new.run
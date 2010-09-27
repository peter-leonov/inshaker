# encoding: utf-8
require "lib/saying"

module Output
  class Worker
    if ENV['REQUEST_METHOD']
      include Saying::HTML
    else
      include Saying::Console
    end
    
    def initialize
      @indent = 0
      @errors_count = 0
      @errors_messages = []
      @warnings_count = 0
      @warnings_messages = []
    end
    
    def indent block
      @indent += 1
      block.call
      @indent -= 1
    end
    
    def indentation
      "  " * @indent
    end
    
    def say msg
      puts "#{indentation}#{msg}"
    end
    
    def error msg
      @errors_count += 1
      @errors_messages << msg
      say_error msg
    end
    
    def warning msg
      @warnings_count += 1
      @warnings_messages << msg
      say_warning msg
    end
    
    def done msg
      say_done msg
    end
    
    def summary
      if @errors_count == 0
        if @warnings_count == 0
          say_done "выполнено без ошибок"
        else
          say_warning "критических ошибок не было"
        end
        return true
      else
        say_error "были критические ошибки"
        say "часть данных не сохранена"
        return false
      end
    end
    
    def errors?
      @errors_count != 0
    end
  end
  
  
  
  $output_worker = Worker.new
  
  def indent &block
    $output_worker.indent block
  end
  
  def say *args
    $output_worker.say *args
  end
  
  def error *args
    $output_worker.error *args
  end
  
  def warning *args
    $output_worker.warning *args
  end
  
  def done *args
    $output_worker.done *args
  end
  
  def summary *args
    $output_worker.summary *args
  end
  
  def errors? *args
    $output_worker.errors? *args
  end
end
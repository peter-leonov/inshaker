# encoding: utf-8

module Output
  module Saying
    module Console
      def say_error str
        say "\x1B[31m#{str}\x1B[0m"
        $stderr.puts str
      end
      def say_warning str
        say "\x1B[33m#{str}\x1B[0m"
      end
      def say_done str
        say "\x1B[32m#{str}\x1B[0m"
      end
    end

    module HTML
      def say_error str
        say %Q{<span class="error">#{str}</span>}
      end
      def say_warning str
        say %Q{<span class="warning">#{str}</span>}
      end
      def say_done str
        say %Q{<span class="done">#{str}</span>}
      end
    end
  end
  
  class Worker
    if ENV['INSHAKER_SAYING_TYPE'] == "HTML"
      include Saying::HTML
    else
      include Saying::Console
    end
    
    attr_reader :errors_count
    
    def initialize
      @indent = 0
      @errors_count = 0
      @errors_messages = []
      @warnings_count = 0
      @warnings_messages = []
      @headers = []
    end
    
    def quite!
      @quite = true
    end
    
    def indent block, header=nil
      @headers << header && "#{indentation}#{header}"
      @indent += 1
      block.call
      @indent -= 1
      @headers.pop
    end
    
    def indentation
      "  " * @indent
    end
    
    def say msg
      if @quite
        return
      end
      
      unless @headers.empty?
        @headers.each do |header|
          puts header if header
        end
        @headers.clear
      end
      
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
end

$output_worker = Output::Worker.new

def indent *args, &block
  $output_worker.indent block, *args
end

def say *args
  $output_worker.say *args
end

def say_header *args
  $output_worker.say_header *args
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

def errors_count *args
  $output_worker.errors_count *args
end

def quite! *args
  $output_worker.quite! *args
end


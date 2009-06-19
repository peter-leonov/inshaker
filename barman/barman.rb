require 'rubygems'
require 'lib/json'
require 'lib/string_util'
require 'lib/fileutils'
require 'templates'
require 'unicode'
require 'fileutils'
require 'erb'
require 'csv'
require 'yaml'

$stdout.sync = true
$KCODE = 'u'

module Barman
  ROOT_DIR = "/www/inshaker/"
  BASE_DIR = ENV['BARMAN_BASE_DIR'] || (ROOT_DIR + "barman/base/")
  
  TEMPLATES_DIR = ROOT_DIR + "barman/templates/" 
  HTDOCS_DIR    = ROOT_DIR + "htdocs/"
  
  class Processor
    def initialize
      @mv_opt = {:remove_destination => true}
      @excl = [".", "..", ".svn", ".TemporaryItems", ".DS_Store", "Goods.csv", "groups.yaml", "tags.yaml", "strengths.yaml", "._groups.yaml"]
      @indent = 0
      @errors_count = 0
      @errors_messages = []
      @warnings_count = 0
      @warnings_messages = []
    end
    
    def flush_json_object(object, dest_file)
      json = object.to_json_expand
      File.open(dest_file, "w+") do |db|
       db.print json
      end
    end
    
    def flush_print_img(src_file, dest_file, size)
      system(%Q{convert $'#{src_file.ansi_quote}' -background white -flatten -scale #{size[0]}x#{size[1]} $'#{dest_file.ansi_quote}'}) or warn "  while converting #{src_file} -> #{dest_file}"
    end
    
    def flush_pngm_img(src, dst)
      system(%Q{pngm "#{src.quote}" "#{dst.quote}" >/dev/null}) or
        warn "  error while pngm #{src} -> #{dst}"
    end
    
    def indent
      @indent += 1
      yield
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
      puts "#{indentation}\x1B[31mОшибка:\x1B[0m #{msg}"
    end
    
    def warning msg
      @warnings_count += 1
      @warnings_messages << msg
      puts "#{indentation}\x1B[33mПредупреждение:\x1B[0m #{msg}"
    end
    
    def done msg
      puts "#{indentation}\x1B[32m#{msg}\x1B[0m"
    end
  end
end

require 'rubygems'
require 'lib/json'
require 'lib/string_util'
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
  end
end

require 'rubygems'
require 'lib/active_support_pmc'
require 'lib/string_util'
require 'templates'
require 'unicode'
require 'fileutils'
require 'erb'
require 'csv'
require 'RMagick'
require 'yaml'

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
      json = ActiveSupport::JSON.encode(object, {:escape => false})
      File.open(dest_file, "w+") do |db|
       db.print json
       db.close
      end
    end
    
    def flush_print_img(src_file, dest_file, size)
      img_list = Magick::ImageList.new(src_file)
      img_list[0].background_color = "white"
      img_list.flatten_images.scale(size[0], size[1]).write(dest_file)
    end
  end
end

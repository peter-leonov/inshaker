# encoding: utf-8

module Inshaker
  class Processor
    def fix_base subdir
      @dediacritized_count = 0
      def walk dir
        dir.each_real do |entry|
          fullpath = "#{dir.path}/#{entry}"
          if entry[0] == "." || File.ftype(fullpath) != "directory"
            next
          end
          
          if entry.has_diacritics
            @dediacritized_count += 1
            # puts fullpath
            clear = "#{dir.path}/#{entry.iy}"
            File.rename(fullpath, clear)
            fullpath = clear
          end
          
          Dir.open(fullpath) do |dir|
            dir.name = entry
            walk dir
          end
        end
      end
      
      walk Dir.new("#{Inshaker::BASE_DIR}/#{subdir}")
      say "#{@dediacritized_count} dir names de-diacritized"
    end
  end
end

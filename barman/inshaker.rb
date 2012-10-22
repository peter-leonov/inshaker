# encoding: utf-8
require "rubygems"
require "templates"
require "yaml"
require "base64"
require "uri"
require "optparse"

NaN = 0.0 / 0
Infinity = 1.0 / 0

require "lib/erb"
require "lib/json"
require "lib/string"
require "lib/file"
require "lib/output"
require "lib/array"
require "lib/number"
require "lib/image"

require "config"
require "processor"
require "entities/entity"

$stdout.sync = true

module Inshaker
  
  class Processor
    attr_reader :user_login
    
    def initialize
      @options = {:optimize_images => true}
      @mv_opt = {:remove_destination => true}
      
      @user_author = ENV["INSHAKER_USER_AUTHOR"]
    end
    
    def flush_json_object(object, dest_file, wrap="%s")
      File.write(dest_file, wrap % object.to_json_expand)
    end
    
    def render_erb path, *opts
      File.write(path, @renderer.result(self.class::Template.new(*opts).get_binding))
    end
    
    def get_img_geometry(src)
      wh = ImageUtils.get_geometry(src)
      unless wh
        error "не могу определить геометрию картинки #{src}"
        return 0, 0
      end
      
      return wh[0], wh[1]
    end
    
    def check_img_geometry_cached(src, dst)
      if File.mtime_cmp(src, dst) == 0
        return true
      end
      w, h = get_img_geometry(src)
      yield w, h
    end
    
    def flush_print_img(src_file, dest_file, size)
      system(%Q{convert $'#{src_file.ansi_quote}' -background white -flatten -scale #{size[0]}x#{size[1]} $'#{dest_file.ansi_quote}'}) or warn "  while converting #{src_file} -> #{dest_file}"
    end
    
    def optimize_img(src, level=5)
      return true unless @options[:optimize_images]
      say "оптимизирую изображение #{src}"
      unless system(%Q{optipng -q -o#{level.to_s} "#{src.quote}"})
        error "не могу оптимизировать изображение (#{src})"
        return false
      end
      true
    end
    
    def mask_img(mask, src, dst, mode)
      unless system(%Q{composite -compose #{mode} "#{mask.quote}" "#{src.quote}" "#{dst.quote}"})
        error "не могу наложить маску (#{src} → #{dst})"
        return false
      end
      true
    end
    
    def flush_masked_optimized(mask, src, dst, mode="CopyOpacity")
      return true if File.mtime_cmp(src, dst) == 0
      mask_img(mask, src, dst, mode) && optimize_img(dst)
      File.mtime_cp(src, dst)
    end
    
    def convert_image(src, dst, quality, width, height)
      return true if File.mtime_cmp(src, dst) == 0
      w, h = get_img_geometry(src)
      unless w == width && h == height
        warning "неверный размер картинки: #{w}x#{h}, нужен: #{width}x#{height}"
      end
      unless system(%Q{convert "#{src.quote}" -resize "#{width.to_s.quote}x#{height.to_s.quote}!" -quality "#{quality.to_s.quote}" "#{dst.quote}"})
        error "не могу преобразовать картинку (#{src} → #{dst})"
        return false
      end
      File.mtime_cp(src, dst)
    end
    
    def cp_if_different src, dst
      return true if File.mtime_cmp(src, dst) == 0
      say "копирую #{src} → #{dst}"
      system(%Q{cp -a "#{src.quote}" "#{dst.quote}" >/dev/null})
    end
    
    def copy_image src, dst, name, soft, hard
      if File.exists? src
        size = File.size(src) / 1024
        if size > hard
          error "картинка (mini.jpg) огромна (#{size}КБ > #{hard}Кб)"
        elsif size > soft
          warning "картинка (mini.jpg) великовата (#{size}КБ > #{soft}Кб)"
        end
        
        begin
          cp_if_different(src, dst)
        rescue
          error "не удалось скопировать картинку #{name} (#{src} → #{dst})"
        end
      else
        error "нет картинки #{name}"
      end
    end
    
    BOM = "\xEF\xBB\xBF".force_encoding("ASCII-8BIT")
    def load_yaml src
      f = File.open(src)
      bom = f.read(3)
      if bom != BOM
        f.seek(0)
      end
      
      yaml = YAML.load(f)
      f.close
      yaml
    end
    
    def load_json src
      JSON.parse(File.read(src))
    end
    
    
    def pre_job
    end
    
    def job_name
      "какую-то задачу"
    end
    
    def job
      error "пустая задача"
    end
    
    def run
      pre_job
      begin
        job
        summary
      rescue => e
        error "Паника: #{e.to_s.force_encoding('UTF-8')}"
        say e.backtrace.join("\n")
        raise e
      end
      
      return errors_count
    end
    
    def sync_base subdir
      # waiting for libiconf for linux to support UTF-8-MAC encoding
      # if ENV['INSHAKER_BASE_DIR']
      #   say "беру данные из #{ENV['INSHAKER_BASE_DIR']}"
      # end
      # 
      # say "синхронизируюсь с базой (папка #{subdir})"
      # dst = "#{Inshaker::ROOT_DIR}barman/base/#{subdir}/"
      # FileUtils.mkdir_p dst
      # indent do
      # system(%Q{rsync -rptvh --delete "barman@toaster:/Shares/inshaker/#{subdir}/" "#{dst}"})
      # end # indent
    end
  end
end

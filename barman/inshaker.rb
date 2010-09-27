# encoding: utf-8
require "rubygems"
require "templates"
require "fileutils"
require "erb"
require "yaml"
require "base64"
require "uri"
require "optparse"

NaN = 0.0 / 0
Infinity = 1.0 / 0

require "lib/json"
require "lib/string_util"
require "lib/fileutils"
require "lib/output"
require "lib/plural"
require "lib/array"

$stdout.sync = true

module Inshaker
  DOMAIN        = "www.inshaker.ru"
  ROOT_DIR      = "/www/inshaker/"
  BASE_DIR      = ENV['INSHAKER_BASE_DIR'] || (ROOT_DIR + "barman/base/")
  LOCK_FILE     = ".lock-inshaker"
  
  TEMPLATES_DIR = ROOT_DIR + "barman/templates/"
  HTDOCS_DIR    = ROOT_DIR + "htdocs/"
  
  class Processor
    include Output
    
    attr_reader :user_login
    
    def initialize
      @options = {:optimize_images => true}
      @mv_opt = {:remove_destination => true}
      @user_login = get_user_login
    end
    
    def flush_json_object(object, dest_file, wrap="%s")
      File.write(dest_file, wrap % object.to_json_expand)
    end
    
    def render_erb path, *opts
      File.write(path, @renderer.result(self.class::Template.new(*opts).get_binding))
    end
    
    def get_img_geometry(src)
      m = `identify -format "%[fx:w]x%[fx:h]" "#{src.quote}"`.match(/^(\d+)x(\d+)$/)
      unless m
        error "не могу определить геометрию кртинки #{src}"
        return {:w => 0, :h => 0}
      end
      
      return {:w => m[1].to_i, :h => m[2].to_i}
    end
    
    def check_img_geometry_cached(src, dst)
      if File.mtime_cmp(src, dst) == 0
        return true
      end
      geometry = get_img_geometry(src)
      yield geometry[:w], geometry[:h]
    end
    
    def flush_print_img(src_file, dest_file, size)
      system(%Q{convert $'#{src_file.ansi_quote}' -background white -flatten -scale #{size[0]}x#{size[1]} $'#{dest_file.ansi_quote}'}) or warn "  while converting #{src_file} -> #{dest_file}"
    end
    
    def flush_pngm_img(src, dst)
      if File.mtime_cmp(src, dst) != 0
        say "крашу фон"
        unless system(%Q{pngm "#{src.quote}" "#{dst.quote}" >/dev/null})
          error "не могу добавить белый фон (#{src} → #{dst})"
          return false
        end
        File.mtime_cp(src, dst)
      end
      true
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
    
    def cp_if_different src, dst
      return true if File.mtime_cmp(src, dst) == 0
      say "копирую #{src} → #{dst}"
      system(%Q{cp -a "#{src.quote}" "#{dst.quote}" >/dev/null})
    end
    
    def copy_image src, dst, name="(без имени бедняжка)", max_size=25
      if File.exists? src
        if File.size(src) > max_size * 1024
          warning "картинка #{name} слишком большая (>#{max_size}Кб)"
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
    
    def load_yaml src
      YAML.load(File.open(src))
    end
    
    def load_json src
      JSON.parse(File.read(src))
    end
    
    def lock
      begin
        Dir.mkdir("#{ROOT_DIR}/#{LOCK_FILE}")
        true
      rescue => e
        false
      end
    end
    
    def unlock
      begin
        # FileUtils.rmtree("#{ROOT_DIR}/#{LOCK_FILE}")
        system(%Q{rm -rf #{"#{ROOT_DIR}/#{LOCK_FILE}".quote}})
        true
      rescue => e
        error "Паника: #{e.to_s.force_encoding('UTF-8')}"
        false
      end
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
      lockpath = "#{ROOT_DIR}/#{LOCK_FILE}"
      if lock
        begin
          File.write("#{lockpath}/pid", $$)
          File.write("#{lockpath}/login", user_login)
          File.write("#{lockpath}/job", job_name)
          job
          summary
        rescue => e
          error "Паника: #{e.to_s.force_encoding('UTF-8')}"
          say e.backtrace.join("\n")
          raise e
        end
        unlock or error "не могу освободить бармена (свободу барменам!)"
      else
        pid = File.exists?("#{lockpath}/pid") && File.read("#{lockpath}/pid").match(/\d+/).to_s.to_i
        if pid && `ps -A | grep #{pid}` =~ /ruby/
          login = File.read("#{lockpath}/login")
          job = File.read("#{lockpath}/job")
          error "бармена #{login_to_name(login)}, запустив #{job}"
        else
          error "в прошлый раз бармен обрушился"
          # say "восстанавливаю локальную версию после сбоя…"
          # system("git reset --hard >>inshaker.log 2>&1")
          unlock
          say "теперь задачу можно перезапустить"
        end
      end
      
      return @errors_count
    end
    
    def get_user_login
      if auth = ENV["HTTP_AUTHORIZATION"].to_s.match(/Basic (.+)/)
        Base64.decode64(auth[1]).split(':')[0]
      else
        "unknown"
      end
    end
    
    def login_to_name login
      {
        "mike" => "занял Мишенька",
        "max" => "занял Максимка",
        "lena" => "заняла Леночка",
        "julia" => "заняла Юлечка",
        "peter" => "занял Петечка",
        nil => "занял Совершенно Неизвестный Человек"
      }[login]
    end
    
    def login_to_author login
      {
        "mike" => "Mikhail Vikhman <mike@inshaker.ru>",
        "max" => "Maxim Dergilev <max@inshaker.ru>",
        "lena" => "Elena Piskareva <lena@inshaker.ru>",
        "julia" => "Julia Gordeeva <julia@inshaker.ru>",
        "peter" => "Peter Leonov <pl@inshaker.ru>",
        "" => "Barman <barman@inshaker.ru>"
      }[login]
    end
  
  end
end

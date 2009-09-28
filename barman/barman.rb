# encoding: utf-8
require 'rubygems'
require 'lib/json'
require 'lib/string_util'
require 'lib/fileutils'
require 'lib/saying'
require 'templates'
require 'fileutils'
require 'erb'
require 'yaml'

$stdout.sync = true

module Barman
  ROOT_DIR = "/www/inshaker/"
  BASE_DIR = ENV['BARMAN_BASE_DIR'] || (ROOT_DIR + "barman/base/")
  LOCK_FILE = ".lock-barman"
  PID_FILE = "barman.pid"
  
  TEMPLATES_DIR = ROOT_DIR + "barman/templates/" 
  HTDOCS_DIR    = ROOT_DIR + "htdocs/"
  
  class Processor
    
    if ENV['REQUEST_METHOD']
      include Saying::HTML
    else
      include Saying::Console
    end
    
    def initialize
      @mv_opt = {:remove_destination => true}
      @excl = [".", "..", ".svn", ".TemporaryItems", ".DS_Store", "Goods.csv", "groups.yaml", "tags.yaml", "strengths.yaml", "._groups.yaml", "mask.png", "bg_mask.png"]
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
      unless system(%Q{pngm "#{src.quote}" "#{dst.quote}" >/dev/null})
        error "не могу добавить белый фон (#{src} → #{dst})"
      end
    end

    def optimize_img(src, level = 5)
      unless system(%Q{optipng -q -o#{level.to_s} "#{src.quote}"})
        error "не могу оптимизировать изображение (#{src})"
      end
    end

    def mask_img(mask, src, dst, mode)
      unless system(%Q{composite -compose #{mode} "#{mask.quote}" "#{src.quote}" "#{dst.quote}"}) 
        error "не могу наложить маску (#{src} → #{dst})"
      end
    end

    def flush_masked_optimized_pngm_img(mask, src, dst, mode = "CopyOpacity")
      tmp = "/tmp/pic.png"
      mask_img(mask, src, tmp, mode)
      optimize_img(tmp)
      flush_pngm_img(tmp, dst)
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
    
    def lock
      begin
        Dir.mkdir("#{ROOT_DIR}#{LOCK_FILE}")
        true
      rescue => e
        false
      end
    end
    
    def unlock
      begin
        Dir.rmdir("#{ROOT_DIR}#{LOCK_FILE}")
        true
      rescue => e
        false
      end
    end
    
    def run
      if lock
        begin
          File.write("#{ROOT_DIR}#{PID_FILE}", $$)
          job
          summary
          File.unlink("#{ROOT_DIR}#{PID_FILE}")
        rescue => e
          error "Паника: #{e}"
        end
        unlock or error "не могу освободить бармена (свободу барменам!)"
      else
        pid = File.read("#{ROOT_DIR}#{PID_FILE}").match(/\d+/).to_s.to_i
        if `ps -A | grep #{pid}` =~ /ruby/
          error "бармена кто-то занял"
        else
          error "в прошлый раз бармен обрушился"
          say "восстанавливаю локальную версию после сбоя…"
          system("git reset --hard >>barman.log 2>&1")
          unlock
          say "теперь бармена можно перезапустить"
        end
        
      end
      
      return @errors_count
    end
    
    def guest_host
      ip = ENV["X_FORWARDED_FOR"].match(/^\d+\.\d+\.\d+\.\d+/)
      if ip
        `nslookup #{ip}`.match(/name = (\w+)/)[1].to_s
      else
        nil
      end
    end
    
    def host_to_name host
      {
        "mike" => "Мишенька",
        "max" => "Максимка",
        "lena" => "Леночка",
        "peter" => "Петенька"
      }[host]
    end
    
    def host_to_author host
      {
        "mike" => "Mikhail Vikhman <mike@inshaker.ru>",
        "max" => "Maxim Dergilev <max@inshaker.ru>",
        "lena" => "Elena Piskareva <lena@inshaker.ru>",
        "peter" => "Peter Leonov <kungfutzu@programica.ru>"
      }[host]
    end
  
  end
end

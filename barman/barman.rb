# encoding: utf-8
require 'rubygems'
require 'templates'
require 'fileutils'
require 'erb'
require 'yaml'

require 'lib/json'
require 'lib/string_util'
require 'lib/fileutils'
require 'lib/saying'

$stdout.sync = true

module Barman
  ROOT_DIR = "/www/inshaker/"
  BASE_DIR = ENV['BARMAN_BASE_DIR'] || (ROOT_DIR + "barman/base/")
  LOCK_FILE = ".lock-barman"
  
  TEMPLATES_DIR = ROOT_DIR + "barman/templates/" 
  HTDOCS_DIR    = ROOT_DIR + "htdocs/"
  
  class Processor
    attr_reader :guest_host
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
      @guest_host = get_guest_host
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
      return if File.mtime_cmp(src, dst) < 0
      unless system(%Q{pngm "#{src.quote}" "#{dst.quote}" >/dev/null})
        error "не могу добавить белый фон (#{src} → #{dst})"
      end
    end

    def optimize_img(src, level = 5)
      return if File.mtime_cmp(src, dst) < 0
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
      return if File.mtime_cmp(src, dst) < 0
      tmp = "/tmp/pic.png"
      mask_img(mask, src, tmp, mode)
      optimize_img(tmp)
      flush_pngm_img(tmp, dst)
    end
    
    def copy_image src, dst, name="(без имени бедняжка)", max_size=25
      if File.exists? src
        if File.size(src) > max_size * 1024
          warning "картинка #{name} слишком большая (>#{max_size}Кб)"
        end

        begin
          File.cp_if_different(src, dst)
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
        Dir.mkdir("#{ROOT_DIR}/#{LOCK_FILE}")
        true
      rescue => e
        false
      end
    end
    
    def unlock
      begin
        FileUtils.rmtree("#{ROOT_DIR}/#{LOCK_FILE}")
        true
      rescue => e
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
          File.write("#{lockpath}/host", guest_host)
          File.write("#{lockpath}/job", job_name)
          job
          summary
        rescue => e
          error "Паника: #{e.to_s.force_encoding('UTF-8')}"
          raise e
        end
        unlock or error "не могу освободить бармена (свободу барменам!)"
      else
        pid = File.exists?("#{lockpath}/pid") && File.read("#{lockpath}/pid").match(/\d+/).to_s.to_i
        if pid && `ps -A | grep #{pid}` =~ /ruby/
          host = File.read("#{lockpath}/host")
          job = File.read("#{lockpath}/job")
          host = nil if host.empty?
          error "бармена занял #{host_to_name(host)}, запустив #{job}"
        else
          error "в прошлый раз бармен обрушился"
          say "восстанавливаю локальную версию после сбоя…"
          # system("git reset --hard >>barman.log 2>&1")
          unlock
          say "теперь задачу можно перезапустить"
        end
      end
      
      return @errors_count
    end
    
    def get_guest_host
      if ENV["X_FORWARDED_FOR"]
        ip = ENV["X_FORWARDED_FOR"].match(/^\d+\.\d+\.\d+\.\d+/)
        if ip
          if name = `nslookup #{ip}`.match(/name = (\w+)/)
            name[1]
          end
        end
      end
      nil
    end
    
    def host_to_name host
      {
        "mike" => "Мишенька",
        "max" => "Максимка",
        "lena" => "Леночка",
        "peter" => "Петенька",
        nil => "Бармен"
      }[host]
    end
    
    def host_to_author host
      {
        "mike" => "Mikhail Vikhman <mike@inshaker.ru>",
        "max" => "Maxim Dergilev <max@inshaker.ru>",
        "lena" => "Elena Piskareva <lena@inshaker.ru>",
        "peter" => "Peter Leonov <kungfutzu@programica.ru>",
        nil => "Barman <barman@inshaker.ru>"
      }[host]
    end
  
  end
end

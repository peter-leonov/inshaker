#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

require "inshaker"
require "mini_magick"

class BrandingProcessor < Inshaker::Processor
  
  class Config
    BASE_DIR       = Inshaker::BASE_DIR + "Branding/"
    HT_ROOT        = Inshaker::HTDOCS_DIR + "skin/"
  end
  
  def initialize
    super
  end
  
  def job_name
    "смешивалку брендинга"
  end
  
  def job
    process_entities
  end
  
  def process_entities
    say "обновляю брендинги"
    indent do
    Dir.new(Config::BASE_DIR).each_dir do |entity_dir|
      update_entity entity_dir
    end
    end # indent
  end
  
  def update_entity src_dir
    say src_dir.name
    unless /^\d\d\d\d\.\d\d$/.match(src_dir.name)
      error "странное имя директории брендинга '#{src_dir.name}', должно быть ГГГГ.ММ"
      return
    end
    indent do

    ht_name = src_dir.name
    ht_dir = Dir.create("#{Config::HT_ROOT}#{ht_name}")
    FileUtils.mkdir_p ht_dir.path


    indent do
      say "парсю ссылку месяца из link.txt"
      unless File.exists?("#{src_dir.path}/link.txt")
        error "нет файла со ссылкой месяца"
        return
      end
      link = File.read("#{src_dir.path}/link.txt")
      link = link.gsub(/\s/, '')
      unless %r{^https?://}.match(link)
        error "содержимое не похоже на ссылку"
        return
      end
      link = link.sub(%r{https?://www\.inshaker\.ru}, '')
      File.write("#{ht_dir.path}/link.txt", link)
    end


    indent do
      say "проверяю картинку баннера image.jpg"
      image = MiniMagick::Image.open("#{src_dir.path}/image.jpg")

      unless image.mime_type == 'image/jpeg'
        warning "не смотря на расширение файла '.jpg', картинка в нем не есть джипег (отрубите руки дизайнеру)"
        image.format "jpg"
      end

      dim = "315x450"
      unless image.dimensions.join('x') == dim
        warning "размер файла не соответствует должным #{dim}px (отрубите руки дизайнеру)"
        image.resize dim
      end

      kb = 75
      unless image.size <= kb * 1024
        warning "файл весит больше #{kb}КБ"
        image.quality "55"
      end

      image.write "#{ht_dir.path}/image.jpg"
    end


    indent do
      say "проверяю картинку фона bg.jpg"
      image = MiniMagick::Image.open("#{src_dir.path}/bg.jpg")

      unless image.mime_type == 'image/jpeg'
        warning "не смотря на расширение файла '.jpg', картинка в нем не есть джипег (отрубите руки дизайнеру)"
        image.format "jpg"
      end

      dim = "2000x1000"
      unless image.dimensions.join('x') == dim
        warning "размер файла не соответствует должным #{dim}px (отрубите руки дизайнеру)"
        # image.resize dim
      end

      kb = 750
      unless image.size <= kb * 1024
        warning "файл весит больше #{kb}КБ"
        image.quality "55"
      end

      image.write "#{ht_dir.path}/bg.jpg"
    end


    ['logo-on-white.png', 'logo-on-black.png'].each do |fname|
      indent do
        say "проверяю картинку логотипа на белом "
        image = MiniMagick::Image.open("#{src_dir.path}/#{fname}")

        unless image.mime_type == 'image/png'
          warning "не смотря на расширение файла '.png', картинка в нем не есть пнг (отрубите руки дизайнеру)"
          image.format "png"
        end

        dim = "100x50"
        unless image.dimensions.join('x') == dim
          warning "размер файла не соответствует должным #{dim}px (отрубите руки дизайнеру)"
        end
      
        kb = 25
        unless image.size <= kb * 1024
          warning "файл весит больше #{kb}КБ"
        end
      
        image.write "#{ht_dir.path}/#{fname}"
      end
    end

    end # indent
  end
end 

# stolen from http://stackoverflow.com/questions/8894194/retrieving-the-hex-code-of-the-color-of-a-given-pixel
module MiniMagick
  class Image
    def pixel_at x, y
      run_command("convert", "#{path}[1x1+#{x.to_i}+#{y.to_i}]", 'txt:').split("\n").each do |line|
        return $1 if /^0,0:.*(#[0-9a-fA-F]+)/.match(line)
      end
      nil
    end

    def average_color
      i = Image.open(path)
      i.resize('1x1')
      i.pixel_at(1,1)
    end
  end
end
# usage:
# i = MiniMagick::Image.open('/www/com/rails/public/uploads/good/icon/1/beluga-vodka-Preview.jpg')
# i.pixel_at(1,1)
# i.average_color


exit BrandingProcessor.new.run

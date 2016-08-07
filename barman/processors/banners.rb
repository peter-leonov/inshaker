#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

require "inshaker"
require "mini_magick"

class BannersProcessor < Inshaker::Processor
  
  class Config
    BASE_DIR       = Inshaker::BASE_DIR + "Banners/"
    HT_ROOT        = Inshaker::HTDOCS_DIR + "banners/"
    DB_JS          = Inshaker::HTDOCS_DIR + "db/banners/banners.json"

    IMAGE = {
      "wide"  => {dim: '627x218', size: 150},
      "small" => {dim: '303x218', size: 75}
    }
  end
  
  def initialize
    super
    @db = []
  end
  
  def job_name
    "смешивалку баннеров"
  end
  
  def job
    process_entities
    save_db
  end

  def process_entities
    say "обновляю баннеры"
    FileUtils.mkdir_p Config::HT_ROOT
    indent do
    Dir.new(Config::BASE_DIR).each_dir do |entity_dir|
      process_entity entity_dir
    end
    end # indent
  end

  def next_id
    @id ||= 0
    @id += 1
  end

  def process_entity src_dir
    say src_dir.name
    entity = {}
    id = next_id
    indent do

    ht_name = id.to_s
    ht_dir = Dir.create("#{Config::HT_ROOT}#{ht_name}")
    FileUtils.mkdir_p ht_dir.path

    indent do
      say "парсю параметры баннера из about.yaml"

      unless File.exists?("#{src_dir.path}/about.yaml")
        error "нет файла about.yaml!"
        return
      end

      about = load_yaml("#{src_dir.path}/about.yaml")

      entity["weight"]                   = about["Вес"].to_i
      entity["query"]                    = about["Запрос"].to_s
      entity["link"]                     = about["Ссылка"].to_s
      entity["type"]                     = about["Размер"].to_s
      entity["showOnAllCocktailsPage"]   = about["Показывать на главной"].to_s

      entity["showOnAllCocktailsPage"] = case entity["showOnAllCocktailsPage"]
        when "да"
          true
        when "нет"
          false
        when ""
          error "не задано значение поля 'Показывать на главной'"
          return
        else
          error "неверное значение поля 'Показывать на главной', выбери 'да' или 'нет'"
          return
        end

      entity["type"] = case entity["type"]
        when "большой"
          "wide"
        when "малый"
          "small"
        when ""
          error "не задано значение поля 'Размер'"
          return
        else
          error "неверное значение поля 'Размер', выбери 'большой' или 'малый'"
          return
        end

      unless %r{^https?://}.match(entity["link"])
        error "ссылка '#{entity["link"]}' не похожа на ссылку"
        return
      end
      entity["link"] = entity["link"].sub(%r{https?://www\.inshaker\.ru}, '')

    end

    indent do
      say "проверяю картинку баннера image.jpg"

      unless File.exists?("#{src_dir.path}/image.jpg")
        error "нет файла!"
        return
      end
      image = MiniMagick::Image.open("#{src_dir.path}/image.jpg")

      unless image.mime_type == 'image/jpeg'
        warning "не смотря на расширение файла '.jpg', картинка в нем не есть джипег (отрубите руки дизайнеру)"
        image.format "jpg"
      end

      dim = Config::IMAGE[entity["type"]][:dim]
      unless image.dimensions.join('x') == dim
        warning "размер файла не соответствует должным #{dim}px (отрубите руки дизайнеру)"
        image.resize dim
      end

      kb = Config::IMAGE[entity["type"]][:size]
      unless image.size <= kb * 1024
        warning "файл весит больше #{kb}КБ"
        image.quality "55"
      end

      image.write "#{ht_dir.path}/image.jpg"
      entity["bgImage"] = "/banners/#{ht_name}/image.jpg"
      entity["bgColor"] = image.average_color
    end

    end # indent

    @db << entity
  end

  def save_db
    flush_json_object(@db, Config::DB_JS)
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


exit BannersProcessor.new.run

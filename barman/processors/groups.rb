#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

require "inshaker"
require "entities/cocktail"
require "entities/ingredient"

class GroupsProcessor < Inshaker::Processor
  
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Groups/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "gruppy-kokteyley/"
    INDEX_PATH     = HT_ROOT + "list.html"
    
    TEMPLATE       = Inshaker::TEMPLATES_DIR + "cocktail-group.rhtml"
  end
  
  def initialize
    super
    @entities = []
    @entities_hrefs = {}
  end
  
  def job_name
    "смешивалку групп коктейлей"
  end
  
  def job
    sync_base "Groups"
    fix_base "Groups"
    
    Ingredient.init
    Cocktail.init
    
    @renderer = ERB.new(File.read(Config::TEMPLATE))
    
    update_groups
    flush_list
    
    unless errors?
      cleanup_deleted
    end
  end
  
  def update_groups
    Dir.new(Config::BASE_DIR).each_dir do |entity_dir|
      say entity_dir.name
      indent do
        process_entity entity_dir
      end
    end
  end
  
  def process_entity src_dir
    return unless File.exists? src_dir.path + "/about.yaml"
    yaml = YAML::load(File.open(src_dir.path + "/about.yaml"))
    
    @entity = OpenStruct.new(
      name:   src_dir.name,
      path:   yaml['Путь'],
      prefix: yaml['Префикс'],
      tags:   yaml['Теги'],
      facts:  yaml['Факты']
    )
    
    seen = @entities_hrefs[@entity.path]
    if seen
      error %Q{группа с такой ссылкой уже существует: "#{seen.name}"}
    else
      @entities_hrefs[@entity.path] = @entity
    end
    
    
    ht_path = Config::HT_ROOT + @entity.path
    FileUtils.mkdir_p ht_path
    ht_dir = Dir.new(ht_path)
    
    update_html ht_dir
    
    @entities << @entity
  end
  
  def update_html dst
    mid = @entity.facts.map(&:size).reduce(:+) / 2
    size = 0
    @column_a, @column_b = @entity.facts.partition {|s| r = size < mid; size += s.size; r }
    
    @cocktails = Cocktail.by_any_of_entities(@entity.tags).sort_by { |c| [c["ingredients"].size, c["name"]] }
    
    File.write("#{dst.path}/#{@entity.path}.html", @renderer.result(binding))
  end
  
  def cleanup_deleted
    say "ищу удаленные"
    indent do
    index = {}
    @entities.each do |entity|
      index[entity.path] = entity
    end
    
    Dir.new(Config::HT_ROOT).each_dir do |dir|
      unless index[dir.name]
        say "удаляю #{dir.name}"
        # FileUtils.rmtree(dir.path)
      end
    end
    end # indent
  end
  
  def flush_list
    File.open(Config::INDEX_PATH, "w+") do |list|
      @entities.each do |g|
        list.puts %Q{<li class="item"><a class="group" href="#{g.path}/" data-query="#{g.tags.join('|')}">#{g.name}</a></li>}
      end
    end
    
  end
end

tags = [
  [["Алкогольные"], "alkogolnye-kokteyli", "Алкогольный коктейль"],
  [["Просто приготовить"], "domashnie-kokteyli", "Домашний коктейль"],
  [["Алкогольные"], "recepty-alkogolnyh-kokteyley", "Рецепт алкогольного коктейля"],
  [["Безалкогольные"], "bezalkogolnye-kokteyli", "Безалкогольный коктейль"],
  [["Милкшейки"], "molochnye-kokteyli", "Молочный коктейль"],
  [["Мохито"], "mojito", "Мохито"],
  [["Красные"], "krasnye-kokteyli", "Красный коктейль"],
  [["Глинтвейны"], "glintvejn", "Коктейль"],
  [["Лимонады"], "limonad", "Лимонад"],
  [["Голубые"], "golubye-kokteyli", "Голубой коктейль"],
  [["Маргариты"], "margarita", "Маргарита"],
  [["Космополитен"], "cosmopolitan", "Космополитен"],
  [["Пина Колада"], "pina-colada", "Пина Колада"],
  [["Водка"], "kokteyli-s-vodkoj", "Коктейль с водкой"],
  [["Виски"], "kokteyli-s-viski", "Коктейль с виски"],
  [["Ром"], "kokteyli-s-romom", "Коктейль с ромом"],
  [["Ликер"], "kokteyli-s-likerom", "Коктейль с ликером"],
  [["Б-52"], "b-52", "Б-52"],
  [["Текила"], "kokteyli-s-tekiloj", "Коктейль с текилой"],
  [["Джин"], "kokteyli-s-djinom", "Коктейль с джином"],
  [["Фруктовые"], "fruktovye-kokteyli", "Фруктовый коктейль"],
  [["Вермут"], "kokteyli-s-martini", "Коктейль с мартини"],
  [["Кола"], "kokteyli-s-koloj", "Коктейль с колой"],
  [["Мороженое", "Сорбет"], "kokteyli-s-morozhenym", "Коктейль с мороженым"],
  [["Клубника", "Свежемороженая клубника"], "klubnichnye-kokteyli", "Клубничный коктейль"],
  [["Банан", "Банановый сок"], "bananovyje-kokteyli", "Банановый коктейль"],
  [["В блендере"], "v-blendere", "В блендере"],
  [["Шоколад черный", "Шоколадный сироп"], "shokoladnyje-kokteyli", "Шоколадный коктейль"],
  [["Классические"], "populyarnyje-kokteyli", "Популярный коктейль"],
  [["Просто приготовить"], "kokteyli-kak-prigotovit", "Как приготовить коктейль"],
  [["Белые"], "beliye-kokteyli", "Белый коктейль"],
  [["Содовая"], "kislorodnyy-kokteyl", "Кислородный коктейль"],
  [["Свежевыжатые"], "kokteyli-dlya-pohudeniya", "Коктейль"],
  [["Самбука светлая"], "kokteyli-s-sambukoy", "Коктейль"],
  [["Сок"], "kokteyli-s-sokom", "Коктейль"],
  [["Молоко"], "belkovye-kokteyli", "Белковый коктейль"],
  [["Лед"], "zamorojennie-kokteyli", "Замороженный коктейль"],
  [["Шахматная доска"], "igry-kokteyli", "Игры с коктейлем"],
  [["Все коктейли"], "kak-sdelat-kokteyl", "Как сделать коктейль"],
  [["Безалкогольные"], "kokteyli-dlya-detey", "Коктейль для детей"],
  [["Все коктейли"], "kokteyli-onlayn", "Коктейль онлайн"],
  [["Морской коктейль"], "morskoy-recepty-s-foto", "Коктейль"],
  [["Шампанское"], "kokteyli-s-shampanskim", "Коктейль с шампанским"],
  [["Все коктейли"], "kupit-kokteyli", "Купить коктейль"],
  [["Морской коктейль"], "morskoy-kokteyl", "Коктейль"],
  [["Все коктейли"], "novie-kokteyli", "Новый коктейль"],
  [["Просто приготовить"], "prostyye-kokteyli", "Простой коктейль"],
  [["Молоко"], "proteinovye-kokteyli", "Протеиновый коктейль"],
  [["Все коктейли"], "sostav-kokteyley", "Состав коктейля"],
  [["Все коктейли"], "vkusniye-kokteyli", "Вкусный коктейль"],
  [["Все коктейли"], "kokteyli-besplatno", "Коктейль бесплатно"],
  [["Безалкогольные"], "kokteyli-dlya-devochek", "Коктейль для девочек"],
  [["Все коктейли"], "kokteyli-otzyvy", "Отзывы о коктейле"],
  [["Ром"], "kokteyli-s-bakardi", "Коктейль с бакарди"],
  [["Б-52"], "kokteyl-video", "Коктейль видео"],
  [["Голубая лагуна"], "kokteyl-laguna", "Коктейль лагуна"],
  [["Зеленые"], "zelenye-kokteyli", "Зеленый коктейль"],
  [["Абсент"], "kokteyli-s-absentom", "Коктейль с абсентом"],
  [["Самые популярные"], "luchshie-kokteyli", "Лучший коктейль"],
  [["Все коктейли"], "nabor-dlya-kokteyley", "Набор для коктейля"],
  [["Водка"], "russkie-kokteyli", "Русский коктейль"],
]


exit GroupsProcessor.new.run
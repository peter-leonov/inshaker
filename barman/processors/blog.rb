#!/usr/bin/env ruby1.9
# encoding: utf-8
require "inshaker"
require "entities/cocktail"

class EventsProcessor < Inshaker::Processor
  
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Blog/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "blog/"
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    POSTS_PREVIEWS = HT_ROOT + "posts.html"
    
    TEMPLATES      = Inshaker::TEMPLATES_DIR
    
    RU_INFLECTED_MONTHNAMES = ['', 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  end
  
  
  def initialize
    super
    @entities = {}
    @entities_array = []
    @entities_hrefs = {}
    @entity  = {} # currently processed entity
  end
  
  def job_name
    "смешивалку блога"
  end
  
  def job
    Cocktail.init
    prepare_dirs
    
    update_blog
    update_posts_loop
    
    unless errors?
      cleanup_deleted
      flush_links
      flush_json
    end
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::HT_ROOT]
  end
  
  def update_blog
    Dir.new(Config::BASE_DIR).each_dir do |post_dir|
      process_entity post_dir
    end
  end
  
  def process_entity src_dir
    say src_dir.name
    indent do
    
    content = File.read(src_dir.path + "/post.html")
    
    # from jekyll 0.10.0 convertivle.rb
    unless m = /^(---\s*\n.*?\n?)^(---\s*$\n?)/m.match(content)
      error "в post.html нету описания на ямле (то, что между ---)"
      return
    end
    content = content[(m[1].size + m[2].size)..-1]
    
    
    yaml = YAML.load(m[1])
    
    @entity = {}
    
    @entity["title"]             = yaml['Заголовок']
    @entity["href"]              = yaml['Ссылка']
    
    ru_date                      = Time.gm(*yaml['Дата'].split(".").reverse.map{|v|v.to_i})
    ru_date_str                  = "#{ru_date.day} #{Config::RU_INFLECTED_MONTHNAMES[ru_date.mon].downcase} #{ru_date.year}"
    @entity["date"]              = ru_date.to_i * 1000
    @entity["date_ru"]           = ru_date_str
    
    content.gsub!(/\(\(\s*(.+?)\s*:\s*(.+?)\s*\)\)/) do
      name = $1
      data = $2
      
      if name == "фотка"
        (src, href) = data.split(/\s+/)
        
        if src !~ /^https?:\/\//
          src = %Q{/blog/#{@entity["href"]}/i/#{src}}
        end
        
        if href
          %Q{<div class="image-box"><a href="#{href}"><img src="#{src}"/></a></div>}
        else
          %Q{<div class="image-box"><img src="#{src}"/></div>}
        end
      elsif name == "коктейль"
        cocktail = Cocktail[data]
        unless cocktail
          error "нет такого коктейля «#{data}» (указан в тексте поста)"
          return
        end
        %Q{<a href="/cocktail/#{cocktail["name_eng"].html_name}/">#{data}</a>}
      else
        %Q{<a href="#{data}">#{name}</a>}
      end
    end
    
    (cut, body) = content.split(/\s*<!--\s*more\s*-->\s*/)
    @entity["cut"]               = cut
    @entity["body"]              = body
    
    
    seen = @entities_hrefs[@entity["href"]]
    if seen
      error %Q{пост с такой ссылкой уже существует: "#{seen["name"]}"}
    else
      @entities_hrefs[@entity["href"]] = @entity
    end
    
    ht_name = @entity["href"]
    ht_path = Config::HT_ROOT + ht_name
    FileUtils.mkdir_p ht_path
    ht_dir = Dir.new(ht_path)
    ht_dir.name = ht_name
    
    FileUtils.cp_r(src_dir.path + "/i/", ht_dir.path + "/i/", @mv_opt)
    
    update_html @entity, ht_dir
    end # indent
    
    @entities[@entity["name"]] = @entity
    @entities_array << @entity
  end
  
  def update_html entity, dst
    renderer = ERB.new(File.read(Config::TEMPLATES + "blog-post.rhtml"))
    
    File.write("#{dst.path}/#{dst.name}.html", renderer.result(Template.new(entity).get_binding))
  end
  
  def update_posts_loop
    renderer = ERB.new(File.read(Config::TEMPLATES + "blog-post-preview.rhtml"))
    
    @entities_array.sort { |a, b| a["date"] - b["date"] }
    File.open(Config::POSTS_PREVIEWS, "w+") do |p|
      @entities_array.each do |entity|
        p.puts renderer.result(Template.new(entity).get_binding)
      end
    end
  end
  
  def cleanup_deleted
    say "ищу удаленные"
    indent do
    index = {}
    @entities_array.each do |entity|
      index[entity["href"]] = entity
    end
    
    Dir.new(Config::HT_ROOT).each_dir do |dir|
      unless index[dir.name]
        say "удаляю #{dir.name}"
        FileUtils.rmtree(dir.path)
      end
    end
    end # indent
  end
  
  def flush_json
    # yet empty
  end
  
  def flush_links
    File.open(Config::NOSCRIPT_LINKS, "w+") do |links|
      @entities.each do |name, entity|
        links.puts %Q{<li><a href="/event/#{entity["href"]}/">#{entity["name"]}</a></li>}
      end
    end
  end
  
  class Template
    def initialize *hashes
      hashes.each do |hash|
        hash.each do |k, v|
          instance_variable_set("@#{k}", v)
        end
      end
    end

    def get_binding
      binding
    end
  end
end

exit EventsProcessor.new.run
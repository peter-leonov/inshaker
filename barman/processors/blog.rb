#!/usr/bin/env ruby1.9
# encoding: utf-8
require "yaml"
require "erb"
require "fileutils"

require "lib/json"
require "lib/output"
require "lib/array"
require "lib/string_util"
require "lib/fileutils"

require "config"
require "entities/entity"
require "entities/cocktail"

class Blog
  
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Blog/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "blog/"
    HT_ROOT_BAN    = Inshaker::HTDOCS_DIR + "blog-banners/"
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    POSTS_PREVIEWS = HT_ROOT + "posts.html"
    
    TEMPLATES      = Inshaker::TEMPLATES_DIR
    
    RU_INFLECTED_MONTHNAMES = ['', 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  end
  
  def run
    Cocktail.init
    
    update_posts
    # update_posts_loop
    
    # unless errors?
    #   cleanup_deleted
    #   flush_links
    #   flush_json
    # end
    
  end
  
  def update_posts
    say "обновляю блог"
    indent do
    Dir.new(Config::BASE_DIR + "posts").each_dir do |dir|
      Blog::Post.new.process(dir)
      # process_entity dir
    end
    end #indent
  end
  
  def update_posts_loop
    renderer = ERB.new(File.read(Config::TEMPLATES + "blog-post-preview.rhtml"))
    
    @@entities_array.sort! { |a, b| b["date"] - a["date"] }
    File.open(Config::POSTS_PREVIEWS, "w+") do |p|
      @@entities_array.each do |entity|
        p.puts renderer.result(Template.new(entity).get_binding)
      end
    end
  end
  
  def cleanup_deleted
    say "ищу удаленные"
    indent do
    index = {}
    @@entities_array.each do |entity|
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
      @@entities.each do |name, entity|
        links.puts %Q{<li><a href="/event/#{entity["href"]}/">#{entity["name"]}</a></li>}
      end
      links.puts ""
    end
  end
  
end

class Blog::Post
  
  def initialize
    @@entities = {}
    @@entities_array = []
    @@entities_hrefs = {}
  end
  
  def process src_dir
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
    
    @data = {}
    
    @data["title"]             = yaml['Заголовок']
    @data["href"]              = yaml['Ссылка']
    
    ru_date = parse_date(yaml['Дата'])
    unless ru_date
      error "не могу понять вашу дату «#{yaml['Дата']}»"
      return
    end
    ru_date_str = "#{ru_date.day} #{Blog::Config::RU_INFLECTED_MONTHNAMES[ru_date.mon].downcase} #{ru_date.year}"
    
    @data["date"]              = ru_date.to_i * 1000
    @data["date_ru"]           = ru_date_str
    
    (cut, body) = content.split(/\s*<!--\s*more\s*-->\s*/)
    cut = markup cut
    body = markup body
    @data["cut"]               = cut
    @data["body"]              = body
    
    
    seen = @@entities_hrefs[@data["href"]]
    if seen
      error %Q{пост с такой ссылкой уже существует: "#{seen["name"]}"}
    else
      @@entities_hrefs[@data["href"]] = @data
    end
    
    ht_name = @data["href"]
    ht_path = Blog::Config::HT_ROOT + ht_name
    FileUtils.mkdir_p ht_path
    ht_dir = Dir.new(ht_path)
    ht_dir.name = ht_name
    
    FileUtils.rmtree(ht_dir.path + "/i/")
    FileUtils.cp_r(src_dir.path + "/i/", ht_dir.path + "/i/", {:remove_destination => true})
    
    update_html @data, ht_dir
    end # indent
    
    @@entities[@data["name"]] = @data
    @@entities_array << @data
  end
  
  def update_html entity, dst
    renderer = ERB.new(File.read(Blog::Config::TEMPLATES + "blog-post.rhtml"))
    
    File.write("#{dst.path}/#{dst.name}.html", renderer.result(Template.new(entity).get_binding))
  end
  
  def parse_date str
    m = /(?<day>\d+)\.(?<month>\d+)\.(?<year>\d+)(?: +(?<hour>\d+)\:(?<minute>\d+))?/.match(str)
    if m
      arr = [m[:year], m[:month], m[:day], m[:hour] || 0, m[:minute] || 0].map { |v| v.to_i }
      Time.gm(*arr)
    end
  end
  
  def markup text
    # links
    text = text.gsub(/\(\(\s*(.+?)\s*:\s*(.+?)\s*\)\)/) do
      name = $1
      data = $2
      
      if name == "фотка"
        (src, href) = data.split(/\s+/)
        
        if src !~ /^https?:\/\//
          src = %Q{/blog/#{@data["href"]}/i/#{src}}
        end
        
        if href == "внутрь"
          %Q{<div class="image-box"><a href="/blog/#{@data["href"]}/#the-one"><img src="#{src}" class="image"/></a></div>}
        elsif href
          %Q{<div class="image-box"><a href="#{href}"><img src="#{src}" class="image"/></a></div>}
        else
          %Q{<div class="image-box"><img src="#{src}" class="image"/></div>}
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
    
    # headers
    text = text.gsub(/^([^\n]+)$\n=+/) do
      header = $1
      %Q{<h2>#{header}</h2>}
    end
    
    # crossed
    text = text.gsub(/---(.+?)---/) do
      words = $1
      %Q{<span class="crossed">#{words}</span>}
    end
    
    # bold
    text = text.gsub(/\*\*\*(.+?)\*\*\*/) do
      words = $1
      %Q{<b>#{words}</b>}
    end
    
    # emails
    text = text.gsub(/(\S+@[a-z0-9\-]{2,}\.[a-z]{2,})/i) do
      email = $1
      %Q{<a href="mailto:#{email}">#{email}</a>}
    end
    
    # paragraphs
    text = "<p>" + text.split(/\n{2,}/).reject{ |v| v.empty? }.join("</p>\n<p>") + "</p>"
    
    return text
  end
end

class Blog::Post::Template
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

$stdout.sync = true
Blog.new.run

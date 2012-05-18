#!/usr/bin/env ruby1.9
# encoding: utf-8
require "optparse"

require "lib/yaml"
require "lib/json"
require "lib/erb"
require "lib/output"
require "lib/array"
require "lib/string"
require "lib/file"
require "lib/image"

require "config"
require "processor"
require "entities/entity"
require "entities/cocktail"

class Blog < Inshaker::Processor
  
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Blog/"
    TAGS_DB        = BASE_DIR + "/tags.yaml"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "blog/"
    HT_ROOT_BAN    = Inshaker::HTDOCS_DIR + "blog-banners/"
    NOSCRIPT_LINKS = HT_ROOT + "links.html"
    TAG_CLOUD      = HT_ROOT + "tag-cloud.html"
    POSTS_LOOP     = HT_ROOT + "posts.html"
    TEMPLATES      = Inshaker::TEMPLATES_DIR
    HT_TAGS_JSON   = Inshaker::HT_DB_DIR + "blog/tags.json"
    
    module Templates
      POST         = TEMPLATES + "blog-post.rhtml"
      POST_PREVIEW = TEMPLATES + "blog-post-preview.rhtml"
    end
    
    RU_INFLECTED_MONTHNAMES = ['', 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  end
end

class Blog::Post
  
  attr_reader :title, :date, :href
  attr_accessor :options
  
  def self.init
    @@seen_hrefs = {}
    @@html_renderer = ERB.read(Blog::Config::Templates::POST)
    @@preview_renderer = ERB.read(Blog::Config::Templates::POST_PREVIEW)
    
    @@known_tags = YAML.read(Blog::Config::TAGS_DB)["Все теги"].hash_index
    @@seen_tags = {}
  end
  
  
  def process src_dir, is_archive
    
    @src_dir = src_dir
    
    if /  |^ | $/ =~ @src_dir.name
      error "лишние пробелы в названии папки"
      return
    end
    
    @src_dir.each do |e|
      next if /^\./ =~ e
      next if /^(post\.html|i)$/ =~ e
      
      error "непонятный файл или папка «#{e}»"
    end
    
    header, content = split_header_from_content File.read(@src_dir.path + "/post.html")
    
    
    absorb_data YAML.load(header)
    
    seen = @@seen_hrefs[@href]
    if seen
      error %Q{пост с такой ссылкой уже существует: "#{seen.title}"}
      return
    else
      @@seen_hrefs[@href] = self
    end
    
    unless @date
      error "не могу понять дату поста"
      return
    end
    @date_ru = russify_date @date
    
    @tags_names = @tags
    @tags = []
    @tags_names.each do |name|
      unless @@known_tags[name]
        warning "неизвестный тег «#{name}»"
        next
      end
      
      tag = @@seen_tags[name]
      unless tag
        tag = {"name" => name, "key" => "tag-#{@@seen_tags.length}"}
        @@seen_tags[name] = tag
      end
      @tags << tag
    end
    
    if @tags.empty?
      error "нету ни одного внятного тега"
    end
    
    if is_archive
      return true
    end
    
    @dst_dir = bake_dir Blog::Config::HT_ROOT + @href, @href
    
    copy_images
    absorb_content content
    
    write_html
    
    true
  end
  
  def absorb_data data
    @title = data['Заголовок']
    @href = data['Ссылка']
    @date = parse_date data['Дата']
    @tags = data["Теги"] ? data["Теги"].split(/\s*,\s*/) : []
  end
  
  def absorb_content content
    @cut, @body = content.split(/\s*<!--\s*more\s*-->\s*/)
    @cut = markup @cut, {:lazy_images => true}
    @body = markup @body
  end
  
  def write_html
    File.write("#{@dst_dir.path}/#{@href}.html", body_html)
    File.write("#{@dst_dir.path}/preview-snippet.html", preview_snippet_html)
  end
  
  def preview_snippet_html
    @@preview_renderer.result(binding)
  end
  
  def body_html
    @@html_renderer.result(binding)
  end
  
  def copy_images
    FileUtils.rmtree(@dst_dir.path + "/i/")
    FileUtils.cp_rf(@src_dir.path + "/i/", @dst_dir.path + "/i/")
  end
  
  def page_href
    "/blog/#{@href}/"
  end
  
  def to_hash
    {
      "date" => @date.to_i * 1000
    }
  end
  
  
  
  
  def markup text, opts={}
    # links
    text = text.gsub(/\(\(\s*(.+?)\s*:\s*(.+?)\s*\)\)/) do
      name = $1
      data = $2
      
      if name == "фотка"
        (src, href) = data.split(/\s+/)
        
        if src !~ /^https?:\/\//
          if opts[:lazy_images]
            box = ImageUtils.get_geometry(@dst_dir.path + "/i/" + src)
            unless box
              error "не могу получить размеры картинки #{src} (возможно, это и не картинка вовсе)"
            end
          end
          src = %Q{/blog/#{@href}/i/#{src}}
        end
        
        if box
          image = %Q{<img lazy-src="#{src}" class="image lazy" width="#{box[0]}" height="#{box[1]}"/>}
        else
          image = %Q{<img src="#{src}" class="image"/>}
        end
        
        if href == "внутрь"
          %Q{<div class="image-box"><a href="/blog/#{@href}/#the-one">#{image}</a></div>}
        elsif href
          %Q{<div class="image-box"><a href="#{href}">#{image}</a></div>}
        else
          %Q{<div class="image-box">#{image}</div>}
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
  
  
  
  def self.tags_list
    @@seen_tags.values.sort { |a, b| a["name"] <=> b["name"] }
  end
  
  
  
  def bake_dir path, name
    FileUtils.mkdir_p path
    dir = Dir.new(path)
    dir.name = name
    return dir
  end
  
  def parse_date str
    m = /(?<day>\d+)\.(?<month>\d+)\.(?<year>\d+)(?: +(?<hour>\d+)\:(?<minute>\d+))?/.match(str)
    if m
      arr = [m[:year], m[:month], m[:day], m[:hour] || 0, m[:minute] || 0].map { |v| v.to_i }
      Time.gm(*arr)
    end
  end
  
  def russify_date date
    "#{date.day} #{Blog::Config::RU_INFLECTED_MONTHNAMES[date.mon].downcase} #{date.year}"
  end
  
  def split_header_from_content text
    # from jekyll 0.10.0 convertivle.rb
    unless m = /^(---\s*\n.*?\n?)^(---\s*$\n?)/m.match(text)
      error "в post.html нету описания на ямле (то, что между ---)"
      return
    end
    return m[1], text[(m[1].size + m[2].size)..-1]
  end
end

class Blog
  
  def initialize
    @posts = []
  end
  
  def job
    fix_base "Blog/posts"
    
    Blog::Post.init
    Cocktail.init
    
    update_posts
    sort_posts
    update_posts_loop
    
    unless errors?
      cleanup_deleted
      flush_links
      flush_tags
      flush_json
    end
    
  end
  
  def update_posts
    say "обновляю блог"
    indent do
    walk_dir Dir.new(Config::BASE_DIR + "posts")
    end #indent
  end
  
  def walk_dir updir, is_archive=false
    updir.each_dir do |dir|
      if /^#/.match(dir.name)
        say "перехожу в «#{dir.name}»"
        walk_dir dir, !@options[:force]
        next
      end
      
      say dir.name
      indent do
      post = Blog::Post.new
      post.options = @options
      if post.process(dir, is_archive)
        @posts << post
      end
      end #indent
    end
  end
  
  def sort_posts
    @posts.sort! do |a, b|
      b.date - a.date
    end
  end
  
  def update_posts_loop
    say "обновляю список постов"
    File.open(Config::POSTS_LOOP, "w+") do |f|
      @posts.each do |post|
        f.puts %Q{<!--# include virtual="#{post.page_href}preview-snippet.html" -->}
      end
    end
  end
  
  def cleanup_deleted
    say "ищу удаленные"
    indent do
    index = {}
    @posts.each do |post|
      index[post.href] = post
    end
    
    Dir.new(Config::HT_ROOT).each_dir do |dir|
      unless index[dir.name]
        say "удаляю #{dir.name}"
        FileUtils.rmtree(dir.path)
      end
    end
    end # indent
  end
  
  def flush_links
    say "рисую ссылки для поисковиков"
    File.open(Config::NOSCRIPT_LINKS, "w+") do |f|
      @posts.each do |post|
        f.puts %Q{<li><a href="/event/#{post.href}/">#{post.title}</a></li>}
      end
      f.puts ""
    end
  end
  
  def flush_tags
    say "рисую теги"
    File.open(Config::TAG_CLOUD, "w+") do |f|
      Blog::Post.tags_list.each do |tag|
        name = tag["name"]
        key = tag["key"]
        f.puts %Q{<li class="tag #{key}"><a class="link" href="/blog/#tag=#{name}">#{name}</a></li>}
      end
      f.puts ""
    end
  end
  
  def flush_json
    say "сохраняю базу тегов"
    File.write(Config::HT_TAGS_JSON, JSON.stringify(Blog::Post.tags_list))
  end
  
  def run
    @options = {}
    OptionParser.new do |opts|
      opts.banner = "Запускайте так: blog.rb [опции]"
      
      opts.on("-f", "--force", "обновлять невзирая на архив") do |v|
        @options[:force] = v
      end
      opts.on("-h", "--help", "помочь") do
        puts opts
        exit
      end
    end.parse!
    
    begin
      job
      summary
    rescue => e
      error "Паника: #{e.to_s.force_encoding('UTF-8')}"
      raise e
    end
    
    return errors_count
  end
  
end

$stdout.sync = true
exit Blog.new.run

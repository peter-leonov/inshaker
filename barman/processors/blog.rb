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
    
    module Templates
      POST         = TEMPLATES + "blog-post.rhtml"
    end
    
    RU_INFLECTED_MONTHNAMES = ['', 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  end
end

class Blog::Post
  
  attr_reader :title, :date, :href
  
  @@seen_hrefs = {}
  
  def process src_dir
    
    @src_dir = src_dir
    
    content = File.read(@src_dir.path + "/post.html")
    
    # from jekyll 0.10.0 convertivle.rb
    unless m = /^(---\s*\n.*?\n?)^(---\s*$\n?)/m.match(content)
      error "в post.html нету описания на ямле (то, что между ---)"
      return
    end
    header = m[1]
    content = content[(m[1].size + m[2].size)..-1]
    
    
    absorb_data YAML.load(header)
    
    unless @date
      error "не могу понять дату поста"
      return
    end
    @date_ru = russify_date @date
    
    
    absorb_content content
    
    
    @dst_dir = bake_dir Blog::Config::HT_ROOT + @href, @href
    
    update_images
    update_html
    
    true
  end
  
  def absorb_data data
    @title = data['Заголовок']
    @href = data['Ссылка']
    @date = parse_date data['Дата']
    
    
    seen = @@seen_hrefs[@href]
    if seen
      error %Q{пост с такой ссылкой уже существует: "#{seen.title}"}
      return
    else
      @@seen_hrefs[@href] = self
    end
  end
  
  def absorb_content content
    (@cut, @body) = content.split(/\s*<!--\s*more\s*-->\s*/)
    @cut = markup @cut
    @body = markup @body
  end
  
  def update_html
    renderer = load_erb Blog::Config::Templates::POST
    File.write("#{@dst_dir.path}/#{@href}.html", renderer.result(binding))
  end
  
  def update_images
    FileUtils.rmtree(@dst_dir.path + "/i/")
    FileUtils.cp_rf(@src_dir.path + "/i/", @dst_dir.path + "/i/")
  end
  
  def to_hash
    {
      "date" => @date.to_i * 1000
    }
  end
  
  
  
  
  def markup text
    # links
    text = text.gsub(/\(\(\s*(.+?)\s*:\s*(.+?)\s*\)\)/) do
      name = $1
      data = $2
      
      if name == "фотка"
        (src, href) = data.split(/\s+/)
        
        if src !~ /^https?:\/\//
          src = %Q{/blog/#{@href}/i/#{src}}
        end
        
        if href == "внутрь"
          %Q{<div class="image-box"><a href="/blog/#{@href}/#the-one"><img src="#{src}" class="image"/></a></div>}
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
  
  def load_erb path
    erb = ERB.new(File.read(path))
    erb.filename = path
    erb
  end
end

class Blog
  
  def initialize
    @posts = []
  end
  
  def run
    Cocktail.init
    
    update_posts
    sort_posts
    # update_posts_loop
    
    # unless errors?
    #   cleanup_deleted
    #   flush_links
    # end
    
  end
  
  def update_posts
    say "обновляю блог"
    indent do
    Dir.new(Config::BASE_DIR + "posts").each_dir do |dir|
      say dir.name
      indent do
        post = Blog::Post.new
        if post.process(dir)
          @posts << post
        end
      end #indent
    end
    end #indent
  end
  
  def sort_posts
    @posts.sort! do |a, b|
      b.date - a.date
    end
  end
  
  def update_posts_loop
    renderer = ERB.new(File.read(Config::TEMPLATES + "blog-post-preview.rhtml"))
    File.open(Config::POSTS_PREVIEWS, "w+") do |f|
      @posts.each do |post|
        f.puts renderer.result(post.binding)
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
    File.open(Config::NOSCRIPT_LINKS, "w+") do |f|
      @posts.each do |post|
        f.puts %Q{<li><a href="/event/#{post.href}/">#{post.title}</a></li>}
      end
      f.puts ""
    end
  end
  
end


$stdout.sync = true
Blog.new.run

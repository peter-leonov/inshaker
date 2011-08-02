#!/usr/bin/env ruby1.9
# encoding: utf-8
require "inshaker"
require "entities/cocktail"

class EventsProcessor < Inshaker::Processor
  
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Blog/"
    
    HT_ROOT        = Inshaker::HTDOCS_DIR + "blog/"
    HT_ROOT_BAN    = Inshaker::HTDOCS_DIR + "blog-banners/"
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
    sync_base "Blog"
    
    Cocktail.init
    prepare_dirs
    
    update_blog
    update_banners
    
    unless errors?
      cleanup_deleted
      flush_links
      flush_json
    end
  end
  
  def prepare_dirs
    FileUtils.mkdir_p [Config::HT_ROOT, Config::HT_ROOT_BAN]
  end
  
  def update_blog
    say "обновляю блог"
    indent do
    Dir.new(Config::BASE_DIR + "posts").each_dir do |dir|
      process_entity dir
    end
    
    update_posts_loop
    end #indent
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
    
    ru_date = parse_date(yaml['Дата'])
    unless ru_date
      error "не могу понять вашу дату «#{yaml['Дата']}»"
      return
    end
    ru_date_str = "#{ru_date.day} #{Config::RU_INFLECTED_MONTHNAMES[ru_date.mon].downcase} #{ru_date.year}"
    
    @entity["date"]              = ru_date.to_i * 1000
    @entity["date_ru"]           = ru_date_str
    
    (cut, body) = content.split(/\s*<!--\s*more\s*-->\s*/)
    cut = markup cut
    body = markup body
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
    
    FileUtils.rmtree(ht_dir.path + "/i/")
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
    
    @entities_array.sort! { |a, b| b["date"] - a["date"] }
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
  
  def parse_date str
    m = /(?<day>\d+)\.(?<month>\d+)\.(?<year>\d+)(?: +(?<hour>\d+)\:(?<minute>\d+))?/.match(str)
    if m
      arr = [m[:year], m[:month], m[:day], m[:hour] || 0, m[:minute] || 0].map { |v| v.to_i }
      Time.gm(*arr)
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
  
  
  # banners ZONE ;)
  
  def update_banners
    say "обновляю банеры"
    indent do
    
    FileUtils.mkdir_p [Config::HT_ROOT_BAN + 'i']
    @small_banners = []
    
    ht_dir = Dir.new(Config::HT_ROOT_BAN)
    
    Dir.new(Config::BASE_DIR + "banners/small").each_dir do |dir|
      process_small_banner dir, ht_dir
    end
    
    flush_banners_html
    
    process_big_banner Dir.new(Config::BASE_DIR + "banners/big"), ht_dir
    
    end #indent
  end
  
  def process_small_banner src_dir, ht_dir
    say src_dir.name
    indent do
    
    banner = {}
    @small_banners << banner
    
    banner["src_dir"] = src_dir
    
    num = @small_banners.length
    banner["num"] = num
    
    yaml = load_yaml(src_dir.path + "/about.yaml")
    banner["href"] = yaml["Ссылка"]
    
    build_image_paths("#{ht_dir.path}/i/small-#{num}.$$").each do |v|
      if File.exists?(v[:path])
        File.unlink(v[:path])
      end
    end
    
    new_image = guess_image_path("#{src_dir.path}/image.$$")
    unless new_image
      error "в папке модного банера нету никакой картинки (image.*)"
    else
      ext = new_image[:ext]
      banner["ext"] = ext
      FileUtils.cp_r(new_image[:path], "#{ht_dir.path}/i/small-#{num}.#{ext}", @mv_opt)
    end
    
    end #indent
  end
  
  def flush_banners_html
    File.open(Config::HT_ROOT_BAN + "/small.html", "w+") do |f|
      @small_banners.each do |banner|
        f.puts %Q{<li class="item"><a href="#{banner["href"]}"><img src="/blog-banners/i/small-#{banner["num"]}.#{banner["ext"]}"/></a></li>}
      end
    end
  end
  
  def process_big_banner src_dir, ht_dir
    say "big"
    indent do
    
    banner = {}
    
    banner["src_dir"] = src_dir
    
    yaml = load_yaml(src_dir.path + "/about.yaml")
    banner["href"] = yaml["Ссылка"]
    
    
    build_image_paths("#{ht_dir.path}/i/big.$$").each do |v|
      if File.exists?(v[:path])
        File.unlink(v[:path])
      end
    end
    
    new_image = guess_image_path("#{src_dir.path}/image.$$")
    unless new_image
      error "в папке крутого банера нету никакой картинки (image.*)"
    else
      ext = new_image[:ext]
      banner["ext"] = ext
      FileUtils.cp_r(new_image[:path], "#{ht_dir.path}/i/big.#{ext}", @mv_opt)
    end
    
    markup = nil
    if banner["ext"] == "swf"
      markup = %Q{
        <object width="960" height="90" type="application/x-shockwave-flash" data="/blog-banners/i/big.#{banner["ext"]}">
          <param name="wmode" value="opaque"/>
          <param name="movie" value="/blog-banners/i/big.#{banner["ext"]}"/>
        </object>
      }
    else
      markup = %Q{<a href="#{banner["href"]}"><img src="/blog-banners/i/big.#{banner["ext"]}"/></a>}
    end
    
    File.open(Config::HT_ROOT_BAN + "/big.html", "w+") do |f|
      f.puts markup
    end
    
    end #indent
  end
  
  def build_image_paths path
    ['jpg', 'png', 'gif', 'swf'].map { |ext| {:path => path.gsub("$$", ext), :ext => ext} }
  end
  
  def guess_image_path path
    build_image_paths(path).each do |v|
      if File.exists?(v[:path])
        return v
      end
    end
    return nil
  end
  
  # etc
  
  def markup text
    # links
    text = text.gsub(/\(\(\s*(.+?)\s*:\s*(.+?)\s*\)\)/) do
      name = $1
      data = $2
      
      if name == "фотка"
        (src, href) = data.split(/\s+/)
        
        if src !~ /^https?:\/\//
          src = %Q{/blog/#{@entity["href"]}/i/#{src}}
        end
        
        if href == "внутрь"
          %Q{<div class="image-box"><a href="/blog/#{@entity["href"]}/#the-one"><img src="#{src}"/></a></div>}
        elsif href
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

exit EventsProcessor.new.run
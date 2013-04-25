#!/usr/bin/env ruby1.9
# encoding: utf-8
$:.push('/www/inshaker/barman')

require "inshaker"
require "entities/cocktail"

class BannersProcessor < Inshaker::Processor
  
  module Config
    BASE_DIR       = Inshaker::BASE_DIR + "Blog/"
    
    HT_ROOT_BAN    = Inshaker::HTDOCS_DIR + "blog-banners/"
  end
  
  
  def initialize
    super
  end
  
  def job_name
    "смешивалку баннеров в блоге"
  end
  
  def job
    sync_base "Blog"
    fix_base "Blog/banners"
    
    update_banners
    
    unless errors?
      flush_html
    end
  end
  
  def update_banners
    say "обновляю банеры"
    indent do
    
    FileUtils.mkdir_p [Config::HT_ROOT_BAN + 'i']
    @small_banners = []
    
    ht_dir = Dir.new(Config::HT_ROOT_BAN)
    
    Dir.new(Config::BASE_DIR + "banners/small").each_dir do |dir|
      process_small_banner dir, ht_dir
    end
    
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
  
  def flush_html
    File.open(Config::HT_ROOT_BAN + "/small.html", "w+") do |f|
      @small_banners.each do |banner|
        f.puts %Q{<li class="item"><a href="#{banner["href"]}"><img src="/blog-banners/i/small-#{banner["num"]}.#{banner["ext"]}"/></a></li>}
      end
    end
  end
  
end

exit BannersProcessor.new.run
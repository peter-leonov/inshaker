# encoding: utf-8
class File
  attr_accessor :name
  
  def self.write file, data
    File.open(file, 'w') do |f|
      f.write data
    end
  end
  
  def self.mtime_cmp a, b
    mtime(a) - mtime(b)
  end
  
  def self.cmtimes_cmp a, b
    mtime(a) == mtime(b) && ctime(a) == ctime(b)
  end
  
  def self.cp_if_different src, dst
    begin
      diff = cmtimes_cmp(src, dst)
    rescue => e
      diff = true
    end
    if diff
      # puts "копирую #{src} → #{dst}"
      system(%Q{cp -a "#{src.quote}" "#{dst.quote}" >/dev/null})
      # FileUtils.cp(src, dst, {:remove_destination => true, :preserve => true})
    end
  end
end

class Dir
  attr_accessor :name
  @@exclude = /^\./
  
  alias :each_real :each
  def each
    each_real do |entry|
      yield entry.force_encoding('UTF-8').gsub('й','й').gsub('Й','Й').gsub('ё','ё').gsub('Ё','Ё')
    end
  end
  
  def each_dir
    each do |entry|
      next if @@exclude =~ entry || File.ftype("#{path}/#{entry}") != "directory"
      Dir.open("#{path}/#{entry}") do |dir|
        dir.name = entry
        yield dir
      end
    end
  end
  
  def each_file
    each do |entry|
      next if @@exclude =~ entry || File.ftype("#{path}/#{entry}") != "file"
      File.open("#{path}/#{entry}") do |dir|
        dir.name = entry
        yield dir
      end
    end
  end
  
  def each_rex rex
    each do |entry|
      m = nil
      next if @@exclude =~ entry || !(m = rex.match entry)
        yield entry, m
    end
  end
  
  def deep_times
    stat = File.stat(path)
    total = {}
    # total[:ctime] = stat.ctime
    total[:mtime] = stat.mtime
    
    each_file do |file|
      stat = File.stat("#{path}/#{file.name}")
      # if stat.ctime > total[:ctime]
      #   total[:ctime] = stat.ctime
      # end
      if stat.mtime > total[:mtime]
        total[:mtime] = stat.mtime
      end
    end
    
    each_dir do |dir|
      sub_total = dir.deep_times
      # if sub_total[:ctime] > total[:ctime]
      #   total[:ctime] = sub_total[:ctime]
      # end
      if sub_total[:mtime] > total[:mtime]
        total[:mtime] = sub_total[:mtime]
      end
    end
    
    return total
  end
end

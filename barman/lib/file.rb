# encoding: utf-8

require "fileutils"

class File
  attr_accessor :name
  
  def self.write file, data
    f = open(file, "w")
    f.write data
    f.close
  end
  
  def self.mtime_cmp a, b
    exists?(b) ? mtime(a) - mtime(b) : Infinity
  end
  
  def self.cmtimes_equal a, b
    exists?(b) && mtime(a) == mtime(b) && ctime(a) == ctime(b)
  end
  
  def self.mtime_cp a, b
    time = mtime(a)
    system(%Q{touch -t #{time.strftime("%Y%m%d%H%M.%S")} "#{b.quote}"})
  end
end

class Dir
  attr_accessor :name
  @@exclude = /^[.@]/
  
  def self.create path
    FileUtils.mkdir_p path
    m = /([^\/]+)\/?$/.match(path)
    dir = new path
    dir.name = m ? m[1] : ""
    return dir
  end
  
  alias :each_real :each
  def each
    each_real do |entry|
      yield entry.force_encoding('UTF-8').iy
    end
  end
  
  def each_dir
    entries = []
    each { |entry| entries << entry }
    entries.sort!
    
    entries.each do |entry|
      next if @@exclude =~ entry || File.ftype("#{path}/#{entry}") != "directory"
      Dir.open("#{path}/#{entry}") do |dir|
        dir.name = entry
        yield dir
      end
    end
  end
  
  def subdir entry
    dir = Dir.open("#{path}/#{entry}")
    dir.name = entry
    dir
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
  
  def deep_mtime
    max = File.mtime(path)
    each do |entry|
      mtime = File.mtime("#{path}/#{entry}")
      if mtime > max
        max = mtime
      end
    end
    
    each_dir do |dir|
      mtime = dir.deep_mtime
      if mtime > max
        max = mtime
      end
    end
    
    return max
  end
end

module FileUtils
  def self.cp_rf src, dst
    cp_r src, dst, {:remove_destination => true}
  end
end
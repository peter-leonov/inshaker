# encoding: utf-8
class File
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
  def each_dir
    each do |entry|
      next if @@exclude =~ entry || File.ftype("#{path}/#{entry}") != "directory"
      Dir.open("#{path}/#{entry}") do |dir|
        dir.name = entry.force_encoding('UTF-8').gsub('й','й')
        yield dir
      end
    end
  end
  def each_rex rex
    each do |entry|
      entry = entry.force_encoding('UTF-8').gsub('й','й')
      m = nil
      next if @@exclude =~ entry || !(m = rex.match entry)
        yield entry, m
    end
  end
end

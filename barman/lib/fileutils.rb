# encoding: utf-8
class File
  def self.write file, data
    File.open(file, 'w') do |f|
      f.write data
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

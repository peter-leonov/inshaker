# encoding: utf-8

module ImageUtils
  
  def self.get_geometry path
    io = IO.popen(["geometry", path])
    wh = io.read
    io.close
    
    m = wh.match(/^(\d+)x(\d+)$/)
    unless m
      return nil
    end
    
    return m[1].to_i, m[2].to_i
  end
  
end
# encoding: utf-8

module ImageUtils
  
  def self.get_geometry path
    m = `identify -format "%[fx:w]x%[fx:h]" "#{path.quote}"`.match(/^(\d+)x(\d+)$/)
    unless m
      return nil
    end
    
    return m[1].to_i, m[2].to_i
  end
  
end
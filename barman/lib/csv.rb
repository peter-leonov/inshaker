require 'csv'

class CSV
  def self.foreach_hash path
    reader = open(path, 'r')
    names = reader.shift
    
    reader.each_with_index do |row, line|
      hash = {}
      names.each_with_index do |v, i|
        hash[v] = row[i]
      end
      yield hash, line + 1 # +1 is a shift
    end
  end
end

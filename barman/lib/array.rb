# encoding: utf-8

class Array
  def hash_index key=nil
    index = {}
    if key
      each do |v|
        index[v[key]] = v
      end
    else
      each do |v|
        index[v] = v
      end
    end
    return index
  end
end

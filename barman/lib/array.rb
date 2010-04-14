# encoding: utf-8

class Array
  def hash_index key
    index = {}
    each do |v|
      index[v[key]] = v
    end
    return index
  end
end

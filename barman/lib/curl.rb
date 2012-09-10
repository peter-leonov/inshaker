# encoding: utf-8

class Curl
  def self.read args
    io = IO.popen(["curl", "-s"] + args)
    r = io.read
    io.close
    return r
  end
  
  def self.bake_query query
    ary = []
    query.each do |k, v|
      ary << "-d"
      ary << "#{k}=#{v}"
    end
    ary
  end
  
  def self.bake_headers headers
    ary = []
    headers.each do |k, v|
      ary << "-H"
      ary << "#{k}: #{v}"
    end
    ary
  end
  
  def self.post url, query={}, headers={}
    read(bake_query(query) + bake_headers(headers) + [url])
  end
  
  def self.get url, query={}, headers={}
    read(bake_query(query) + bake_headers(headers) + ["-G", url])
  end
end

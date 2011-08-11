# encoding: utf-8
require "erb"

class ERB
  def self.read path
    o = self.new(File.read(path))
    o.filename = path
    o
  end
end

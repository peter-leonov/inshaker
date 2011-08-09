# encoding: utf-8
require "yaml"

module YAML
  def self.read path
    self.load(File.open(path))
  end
end

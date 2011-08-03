# encoding: utf-8
module Inshaker
  class Entity
    def self.init
    end
    
    def self.check_integrity
    end
    
    def self.all
      @db
    end

    def self.[] name
      @by_name[name]
    end
  end
end
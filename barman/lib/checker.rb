#!/opt/ruby1.9/bin/ruby -W0
# encoding: utf-8
require "inshaker"
require "entities/ingredient"
require "entities/cocktail"
require "entities/barman"
require "entities/bar"

class Checker
  def self.init
    Ingredient.init
    Cocktail.init
    Barman.init
    Bar.init
  end
  def self.check
    Ingredient.check_integrity
    Cocktail.check_integrity
    Barman.check_integrity
    Bar.check_integrity
  end
end

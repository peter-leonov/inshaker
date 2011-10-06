# encoding: utf-8

class Float
  def may_be_to_i
    i = to_i
    i == self ? i : self
  end
end

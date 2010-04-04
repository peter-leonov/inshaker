
class Numeric
  # 1, 2, 5: банкир, банкира, банкиров
  def plural a, b, c
    return b if self % 1 != 0
    
    v = self.abs % 100
    return c if 11 <= v && v <= 19
    
    v = v % 10
    return b if 2 <= v && v <= 4
    return a if v == 1
    return c
  end
end

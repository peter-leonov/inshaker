module Saying
  module Console
    def say_error str
      say "\x1B[31m#{str}\x1B[0m"
    end
    def say_warning str
      say "\x1B[33m#{str}\x1B[0m"
    end
    def say_done str
      say "\x1B[32m#{str}\x1B[0m"
    end
  end
  
  module HTML
    def say_error str
      say %Q{<span style="color:red">#{str}</span>}
    end
    def say_warning str
      say %Q{<span style="color:yellow">#{str}</span>}
    end
    def say_done str
      say %Q{<span style="color:green">#{str}</span>}
    end
  end
end
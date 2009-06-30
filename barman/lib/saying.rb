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
      say %Q{<span style="color:#d40">#{str}</span>}
    end
    def say_warning str
      say %Q{<span style="color:#e80">#{str}</span>}
    end
    def say_done str
      say %Q{<span style="color:#082">#{str}</span>}
    end
  end
end
require "json"

class String
  ESCAPED_CHARS = {
    "\010" =>  '\b',
    "\f"   =>  '\f',
    "\n"   =>  '\n',
    "\r"   =>  '\r',
    "\t"   =>  '\t',
    '"'    =>  '\"',
    '\\'   =>  '\\\\',
    # for compliance with xml
    '>'    =>  '\u003E',
    '<'    =>  '\u003C',
    '&'    =>  '\u0026'
  }
  def to_json(options = nil)
    ('"' + gsub(/[\010\f\n\r\t"\\><&]/) { |s| ESCAPED_CHARS[s] } + '"').gsub('й','й')
  end
end

class Object
  def to_json_expand
    to_json
  end
end

class Hash
  def to_json expand = false
    # prevents non-string keys to breake the sort below
    temp = {}
    each_pair do |k, v|
      temp[k.to_s] = v
    end
    
    # sort out hash keys to gurantee the same order with the same keys set between launches
    pairs = []
    temp.keys.sort.each do |k|
      pairs.push("#{k.to_s.to_json}:#{temp[k].to_json}")
    end
    expand ? "{\n#{pairs.join(",\n")}\n}" : "{#{pairs.join(",")}}"
  end
  def to_json_expand
    to_json true
  end
end

class Array
  def to_json_expand
    "[\n" + map{ |v| v.to_json }.join(",\n") + "\n]"
  end
end

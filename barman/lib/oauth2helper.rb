# encoding: utf-8

class OAuth2Helper
  module Config
    CLIENT_ID      = "3164701909-cl0sa37gnh889cr5f043t6aeim88r7gk.apps.googleusercontent.com"
    TOKEN_URI      = "https://accounts.google.com/o/oauth2/token"
    INFO_URI       = "https://www.googleapis.com/oauth2/v1/tokeninfo"
    SECRET         = ENV["ANALYTICS_CLIENT_SECRET"]
    TOKEN_REFRESH  = "1/db0zlC0q9jiRo6vlQ45zWnFx32ER3orsVS089-NKCao"
  end
  
  def temp= dir
    @token_cache = "#{dir}/access-token.txt"
  end
  
  def check_token t
    r = Curl.get(Config::INFO_URI, {"access_token" => t})
    # puts r
    r = JSON.parse(r)
    
    r["expires_in"].to_i > 1800 # half an hour
  end
  
  def request_access_token
    query =
    {
      "client_id" => Config::CLIENT_ID,
      "client_secret" => Config::SECRET,
      "refresh_token" => Config::TOKEN_REFRESH,
      "grant_type" => "refresh_token"
    }
    
    r = Curl.post(Config::TOKEN_URI, query)
    # puts r
    r = JSON.parse(r)
    
    r["access_token"]
  end
  
  def token
    return @token if @token
    
    unless File.exists?(@token_cache)
      return
    end
    
    @token = File.read(@token_cache)
  end
  
  def token= t
    @token = t
    File.write(@token_cache, @token)
    @token
  end
  
  def get_access_token
    token = self.token
    if check_token(token)
      return token
    end
    
    self.token = request_access_token
  end
end

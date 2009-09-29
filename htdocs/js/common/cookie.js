/**
 * Cookie functionality. 
 * All cookies are saved with "path=/"
 */
var Cookie = {
  set: function(name, value) {
    return (document.cookie = escape(name) + '=' + escape(value || '') + "; path=/");
  },

  get: function(name) {
    var cookie = document.cookie.match(new RegExp('(^|;)\\s*' + escape(name) + '=([^;\\s]*)'));
    return (cookie ? unescape(cookie[2]) : null);
  },

  remove: function(name) {
    var cookie = Cookie.get(name) || true;
    Cookie.set(name, '', -1);
    return cookie;
  },
  
  getKeys: function(){
	var res = [];
	var arr = document.cookie.match(/(\w+)=[\w\d\S]*;*/ig);
	for(var i = 0; i < arr.length; i++){
		res.push(arr[i].split("=")[0])
	}
	return res;
  },
  
  clear: function(){
	var keys = Cookie.getKeys();
	for(var i = 0; i < keys.length; i++) Cookie.remove(keys[i]); 
  }
};

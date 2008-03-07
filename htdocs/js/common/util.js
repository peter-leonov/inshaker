String.prototype.htmlName = function () {
	return this.toLowerCase().replace(/ /g, "_");
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.substr(1);
}

String.prototype.beforeTag = function() {
	if(this.match(/(.+)<.+>.*<\/.+>/)) {
		return this.match(/(.+)<.+>.*<\/.+>/)[1]
	} else return this;
}

Array.prototype.uniq = function(){
	var tmp = [];
	for(var i = 0; i < this.length; i++){
		if(tmp.indexOf(this[i]) == -1) tmp.push(this[i]);
	}
	return tmp;
}

Array.prototype.without = function(index) {
	var tmp = [];
	for(var i = 0; i < this.length; i++){
		if(i != index) tmp.push(this[i]);
	}
	return tmp;
}

function toArray(hash) {
	var results = [];
	for(key in hash) results.push(hash[key]);
	return results;
}


var Cookie = {
  set: function(name, value) {
    return (document.cookie = escape(name) + '=' + escape(value || ''));
  },

  get: function(name) {
    var cookie = document.cookie.match(new RegExp('(^|;)\\s*' + escape(name) + '=([^;\\s]*)'));
    return (cookie ? unescape(cookie[2]) : null);
  },

  erase: function(name) {
    var cookie = Cookie.get(name) || true;
    Cookie.set(name, '', -1);
    return cookie;
  },

  accept: function() {
    if (typeof navigator.cookieEnabled == 'boolean') {
      return navigator.cookieEnabled;
    }
    Cookie.set('_test', '1');
    return (Cookie.erase('_test') = '1');
  }
};

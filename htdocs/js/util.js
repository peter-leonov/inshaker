String.prototype.htmlName = function () {
	return this.toLowerCase().replace(/ /g, "_");
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.substr(1);
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
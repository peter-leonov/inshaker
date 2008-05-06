/**
 * Реализация постоянного хранилища данных
 *
 * На основе библиотеки Storage.js v1.1
 * (c) 2008, Ilya Kantor (http://browserpersistence.ru)
 */

Storage = {
    swfUrl: "/js/common/storage.swf",    
    init: function(onready) {                
       	var browser = navigator.userAgent;
		var rx = Programica.userAgentRegExps;
		if(rx.Gecko.test(browser)) this.globalStorage(onready);
		// if(rx.Gecko.test(browser)) this.windowName(onready);
		else if(rx.MSIE.test(browser)) this.userData(onready);
		// else if(rx.MSIE.test(browser)) this.windowName(onready);
		else this.flash8(onready); 
    }
};

/**
 * HTML5 standard
 * @browsers Firefox 2+, MSIE 8
 */
Storage.globalStorage = function(onready) {
    var storage = globalStorage[location.hostname];
    Storage = {
        get:    function(key)        { return storage[key] ? String(storage[key]) : null; },
        put:    function(key, value) { storage[key] = value; },
        remove: function(key)        { delete storage[key]; },    
        clear:  function()           { for(i in storage) delete storage[i]; },

        getKeys: function() {
            var res = [];
            for(i in storage) res.push(i);
            return res;
        }
    }
    onready();
};

/**
 * @browsers WebKit
 */
Storage.sqlite = function(onready){
	onready();
};

Storage.windowName = function(onready){
	Storage = {
		put: function(name, value) {
			var reg = new RegExp(name+"=([^;]+);");
			if(!window.name.match(reg)) {
				window.name = window.name + name + "=" + escape(value) + ";";
			} else {
				var pair = window.name.match(reg)[0];
				var idx  = window.name.indexOf(pair);
				window.name = name + "=" + escape(value) + ";" + window.name.substr(0, idx) + window.name.substr(idx+pair.length, window.name.length);
			}
		},
		
		get: function(name) {
			var reg = new RegExp(name+"=([^;]+);");
			if(window.name.match(reg)) return unescape(window.name.match(reg)[1]);
			return null;
		},
		
		remove: function(name) {
			var reg = new RegExp(name+"=([^;]+);");
			if(window.name.match(reg)) {
				var pair = window.name.match(reg)[0];
				var idx  = window.name.indexOf(pair);
				window.name = window.name.substr(0, idx) + window.name.substr(idx+pair.length, window.name.length);
			}
			return pair;
		}, 
		
		clear: function() {
			window.name = "";
		}
	}
	onready();
};

/**
 * @browsers MSIE 5+
 */
Storage.userData = function(onready) {
    var namespace = "data";

    if (!document.body.addBehavior) {            
        throw new Error("No addBehavior available");
    }

	var e = document.createElement("iframe");
	e.setAttribute('id', 'storageFrame');
	e.style.border = '0';
	e.style.width  = '0';
	e.style.height = '0';
	var iframe = document.body.appendChild(e);
	iframe.src='/js/common/proxy.html';
	
	iframe.addEventListener('load', function(e){
		var storage = iframe.contentWindow.document.getElementById('storageElement');
		storage.load(namespace);

	    Storage = {
	        get: function(key) {
	            return storage.getAttribute(key);
	        },

	        put: function(key, value) {
	            storage.setAttribute(key, value);
	            storage.save(namespace);
	        },

	        remove: function(key) {
	            storage.removeAttribute(key);
	            storage.save(namespace);
	        },

	        clear: function() {
	            var attrs = storage.XMLDocument.documentElement.attributes;

	            for(var i = 0; i < attrs.length; i++) storage.removeAttribute(attrs[i].name);
	            storage.save(namespace);
	        },

	        getKeys: function() {
	            var res = [];
	            var attrs = storage.XMLDocument.documentElement.attributes;

	            for(var i = 0; i < attrs.length; i++) res.push(attrs[i].name);
	            return res;
	        }
	    }
	    onready();
	}, false);
};

/**
 * Flash 8
 * @browsers any
 */
Storage.flash8 = function(onready) { 
    var movie = null;
    var swfId = "StorageMovie";
    
	while(document.getElementById(swfId)) swfId = '_' + swfId;
    
	var swfUrl = Storage.swfUrl;
    
    // first setup storage, make it ready to accept back async call
    Storage = {       
        get:    function(key)        { return movie.get(key)},
		put:    function(key, value) { movie.put(key, value); },
        remove: function(key)        { movie.remove(key); },
        clear:  function()           { movie.clear(); },
        
        getKeys: function() {
            return movie.getkeys();  // lower case in flash to evade ExternalInterface bug         
        },
        
        ready: function() {
            movie = document[swfId];
            onready();
        }
    }
    
    // embed flash into document
    var protocol = window.location.protocol == 'https' ? 'https' : 'http';
    var containerStyle = "width:0; height:0; position: absolute; z-index: 10000; top: -1000px; left: -1000px;";        
    var objectHTML = '<embed src="' + swfUrl + '" '
                              + ' bgcolor="#ffffff" width="0" height="0" '
                              + 'id="' + swfId + '" name="' + swfId + '" '
                              + 'swLiveConnect="true" '
                              + 'allowScriptAccess="sameDomain" '
                              + 'type="application/x-shockwave-flash" '
                              + 'pluginspage="' + protocol +'://www.macromedia.com/go/getflashplayer" '
                              + '></embed>';                    
    var div = document.createElement("div");
    div.setAttribute("id", swfId + "Container");
    div.setAttribute("style", containerStyle);
    div.innerHTML = objectHTML;
    document.body.appendChild(div);
};
    

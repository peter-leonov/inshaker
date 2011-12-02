function keyForValue(hash, value) {
  for(var key in hash) if(hash[key] == value) return key
  return null
}

function CocktailsController (states, cookies, model, view) {
	this.model = model;
	this.view	= view;
	
	this.hashTimeout = null;
	
	this.initialize = function () {
		var filters = this.filtersFromRequest();
		var states = null;
		
		this.view.controller = this;
		this.model.initialize(filters);
		
		// fix for cocktails initialization issue
		this.currentHash = window.location.hash
		var me = this
		function checkHash ()
		{
			if (me.currentHash != window.location.hash)
				window.location.reload(true)
		}
		setInterval(checkHash, 250)
	};
	
	this.filtersFromRequest = function () {
		var address = window.location.href;
		var match = address.match(/.+\#(.+)/);
		if(match){
			var params = match[1].split("&");
			var filters = {};
			for(var i = 0; i < params.length; i++) {
				var pair = params[i].split("=");
				filters[pair[0]]=decodeURIComponent(pair[1]);
			}
            filters.state = states[filters.state];
			filters.page = +filters.page || 0
			return filters;
		} else return null;
	};
	
	this.saveFilters = function (filters) {
		var self = this;
		clearTimeout(this.hashTimeout);
		this.hashTimeout = setTimeout(function() { 
			self.updatePageHash(filters);
		} , 400);
	};
	
	this.updatePageHash = function(filters) {
		var pairs = [];
		for(var key in filters)
			if(filters[key] != "" || (filters[key] === 0 && key != "page")) {
				var value = filters[key];
				if(key == "state") value = keyForValue(states, value)
				pairs.push([key, value]);
			}
		
		var hash = [], encode = encodeURIComponent;
		for(var i = 0; i < pairs.length; i++) {
			hash[i] = encode(pairs[i][0]) + "=" + encode(pairs[i][1]);
		}
		if (hash)
		{
			window.location.hash = hash.join('&')
			this.currentHash = window.location.hash
		}
	};
	
	this.onLetterFilter = function(letter, all) {
		this.model.onLetterFilter(letter, all);
	};
	
	this.onNameFilter = function(name){
		this.model.onNameFilter(name);
	};
	
	this.onPageChanged = function(num){
		this.model.onPageChanged(num);
	};
	
	this.onStateChanged = function(num){
		this.model.onStateChanged(num);
	}
	
	this.needRandomCocktailNames = function(){
		return this.model.randomCocktailNames();
	};
	
	this.initialize();
};

function CocktailsController (model, view, cookies) {
	this.model = model;
	this.view  = view;
	
	this.initialize = function () {
		var filters = this.filtersFromRequest();
        var states = null;
        if(!filters) {
            filters = this.filtersFromCookie();
            states = this.statesFromCookies();
        }
		var forceChange = this.forceFromCookies();
		
		this.view.controller = this;
		this.model.initialize(filters, states, forceChange);
	};
	
	this.filtersFromRequest = function () {
		var address = window.location.href;
		var match = address.match(/.+\?(.+)/);
		if(match){
			var params = match[1].split("&");
			var filters = {};
			for(var i = 0; i < params.length; i++) {
				var pair = params[i].split("=");
				filters[pair[0]]=decodeURIComponent(pair[1]);
			}
			return filters;
		} else return null;
	};
	
 	this.statesFromCookies = function () {
        var res = [];
        var ss = Cookie.get(cookies.strengthState);
        if(ss) res[0] = Object.parse(ss);
        var ts = Cookie.get(cookies.tagState);
        if(ts) res[1] = Object.parse(ts);
        return res;
    };

	this.filtersFromCookie = function () {
		var cookie = Cookie.get(cookies.filter);
		if(cookie) return Object.parse(cookie);
		else return null;
	};
	
	this.forceFromCookies = function () {
		var force = Cookie.get(cookies.force);
		Cookie.remove(cookies.force);
		return force;
	};
	
	this.saveState = function (filters, tagState, strengthState) {
		Cookie.set(cookies.tagState, Object.stringify(tagState));
    Cookie.set(cookies.strengthState, Object.stringify(strengthState));
    Cookie.set(cookies.filter, Object.stringify(filters));
	};
	
	this.onLetterFilter = function(letter, all) {		
		this.model.onLetterFilter(letter, all);
	};
	
	this.onTagFilter = function(tag) {
		this.model.onTagFilter(tag);
	};
	
	this.onStrengthFilter = function(strength) {
		this.model.onStrengthFilter(strength);
	};
	
	this.onIngredientFilter = function(name, remove) {
		this.model.onIngredientFilter(name, remove);
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
	
	this.needRandomIngredient = function(){
		return this.model.randomIngredient();
	};
	
	this.needRandomCocktailNames = function(){
		return this.model.randomCocktailNames();
	};
	
	this.initialize();
};

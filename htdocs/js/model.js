var Model = {
	resultSet    : [],
	cocktailsSet : [],

	tags        : tags,
	strengths   : strengths,
	ingredients : ingredients,
	
	filters: {
		letter      : "",
		tag         : "",
		strength    : "",
		ingredients : []
	},
	
	dataListener : null,
	
	init: function(json) {
		this.resultSet = this.cocktailsSet = toArray(cocktails).sort(this._sortFunc);
		if(json) this._restoreFiltersFromJSON(json);
		this._applyFilters();
	},
	
	_restoreFiltersFromJSON : function(json) { this.filters = JSON.parse(json); },
	
	onLetterFilter: function(name, name_all) { 
		if(name != this.filters.letter) {
			this.filters.ingredients = [];
			this.filters.tag         = "";
			this.filters.strength    = "";
			if(name != name_all) {
				this.filters.letter    = name;
			} else this.filters.letter = "";
			this._applyFilters();
		}
	},
	
	onTagFilter: function(name) { 
		if(name != this.filters.tag) {
			this.filters.letter = "";
			this.filters.tag    = name;  
		} else this.filters.tag  = "";
		this._applyFilters();
	},
	
	onStrengthFilter: function(name) { 
		if(name != this.filters.strength) {
			this.filters.letter     = "";
			this.filters.strength   = name;
		} else this.filters.strength = "";
		this._applyFilters(); 
	},
		
	onIngredientFilter: function(name) {
		this.filters.letter = "";
		var idx = -1;
		if((idx = this.filters.ingredients.indexOf(name)) == -1) {
			   this.filters.ingredients.push(name);
		} else this.filters.ingredients.splice(idx, 1);
		this._applyFilters();
	},
	
	_applyFilters: function() {
		var filtered = false;
		if(this.filters.letter.length > 0){
			this.resultSet = this._filterByLetter(this.cocktailsSet, this.filters.letter);
			this.dataListener.onModelChanged(this.resultSet, this.filters);
			return 0;
		} else this.resultSet = this.cocktailsSet;
		if(this.filters.tag.length > 0) {
			this.resultSet = this._filterByTag(this.cocktailsSet, this.filters.tag);
			filtered = true;
		}
		if(this.filters.strength.length > 0) {
			var to_filter = [];
			if(filtered) { to_filter = this.resultSet } else { to_filter = this.cocktailsSet }
			this.resultSet = this._filterByStrength(to_filter, this.filters.strength);
			filtered = true;
		}
		if(this.filters.ingredients.length > 0) {
			var to_filter = [];
			if(filtered) { to_filter = this.resultSet } else { to_filter = this.cocktailsSet }
			this.resultSet = this._filterByIngredients(to_filter, this.filters.ingredients);
			filtered = true;
		}
		this.dataListener.onModelChanged(this.resultSet, this.filters);
	},
	
	_filterByLetter: function (set, letter){
		var res = [];	
		var reg = new RegExp("^(" + letter.toUpperCase() + ")");
		for(var i = 0; i < set.length; i++) {
			if(set[i].name.match(reg)){
				res.push(set[i]);
			}
		}
		return res;
	},
	
	_filterByTag: function (set, tag) {
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].tags.indexOf(tag) > -1){
				res.push(set[i]);
			}
		}
		return res;
	},
	
	_filterByStrength: function(set, strength) {
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].strength == strength) {
				res.push(set[i]);
			}
		}
		return res;
	},
	
	_filterByIngredients: function(set, ingredients) {
		var res = [];
		for(var i = 0; i < set.length; i++) {
			var good = 0;
			for(var j = 0; j < set[i].ingredients.length; j++) {
				for(var k = 0; k < ingredients.length; k++){
					if(set[i].ingredients[j][0] == ingredients[k]) good++;
				}
			}
			if(good == ingredients.length) res.push(set[i]);
		}
		return res;
	},
	
	_sortFunc: function(a, b){
		if(a.name > b.name) return 1;
		else if(a.name == b.name) return 0;
		else return -1;
	}
}
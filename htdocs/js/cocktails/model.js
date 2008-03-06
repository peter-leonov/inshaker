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
		ingredients : [],
		page        : 0,
	},
	
	dataListener : null,
	
	init: function(filters) {
		this.resultSet = this.cocktailsSet = toArray(cocktails).sort(DataFilter.nameSort);
		if(filters) this.filters = this._completeFilters(filters);
		this._applyFilters();
	},
	
	_completeFilters: function(filters){
		if(!filters.letter)      filters.letter = "";
		if(!filters.tag)         filters.tag = "";
		if(!filters.strength)    filters.strength = "";
		if(!filters.ingredients) filters.ingredients = [];
		if(!filters.page)        filters.page = 0;
		return filters;
	},
	
	onPageChanged: function(num){
		this.filters.page = num;
		this.dataListener.saveFilters(this.filters);
	},
	
	onLetterFilter: function(name, name_all) { 
		if(name != this.filters.letter) {
			this.filters.ingredients = []; // reset
			this.filters.tag         = ""; // some
			this.filters.strength    = ""; // filters
			this.filters.page        = 0;  // page, too
			
			if(name != name_all) {
				this.filters.letter    = name;
			} else this.filters.letter = "";
			this._applyFilters();
		}
	},
	
	onTagFilter: function(name) { 
		if(name != this.filters.tag) {
			this.filters.letter = ""; // reset
			this.filters.tag    = name;  
		} else this.filters.tag  = "";
		this.filters.page = 0; // anyway
		this._applyFilters();
	},
	
	onStrengthFilter: function(name) { 
		if(name != this.filters.strength) {
			this.filters.letter     = ""; // reset
			this.filters.strength   = name;
		} else this.filters.strength = "";
		this.filters.page = 0; // anyway
		this._applyFilters(); 
	},
		
	onIngredientFilter: function(name, remove) {
		this.filters.letter = ""; // reset
		this.filters.page   = 0;  // anyway
		
		var idx = this.filters.ingredients.indexOf(name);
		if(remove) {
			this.filters.ingredients.splice(idx, 1);
		} else if (idx == -1){
			this.filters.ingredients.push(name);
		} else return; // duplicate entry
		this._applyFilters();
	},
	
	_applyFilters: function() {
		var filtered = false;
		if(this.filters.letter.length > 0){
			this.resultSet = DataFilter.cocktailsByLetter(this.cocktailsSet, this.filters.letter);
			this.dataListener.onModelChanged(this.resultSet, this.filters);
			return 0;
		} else this.resultSet = this.cocktailsSet;
		if(this.filters.tag.length > 0) {
			this.resultSet = DataFilter.cocktailsByTag(this.cocktailsSet, this.filters.tag);
			filtered = true;
		}
		if(this.filters.strength.length > 0) {
			var to_filter = [];
			if(filtered) { to_filter = this.resultSet } else { to_filter = this.cocktailsSet }
			this.resultSet = DataFilter.cocktailsByStrength(to_filter, this.filters.strength);
			filtered = true;
		}
		if(this.filters.ingredients.length > 0) {
			var to_filter = [];
			if(filtered) { to_filter = this.resultSet } else { to_filter = this.cocktailsSet }
			this.resultSet = DataFilter.cocktailsByIngredients(to_filter, this.filters.ingredients);
			filtered = true;
		}
		this.dataListener.onModelChanged(this.resultSet, this.filters);
	}
}
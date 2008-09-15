function CocktailsModel (view) {
	this.resultSet = [];
	this.cocktailsSet = [];

	this.tags        = Cocktail.tags;
	this.strengths   = Cocktail.strengths;
	this.ingredients = Cocktail.ingredients;
	
	this.filters = {
		letter      : "",
		tag         : "",
		strength    : "",
		ingredients : [],
		page        : 0
	},
    
    // current subsets of strengths and tags
    this.strengthState = [];
    this.tagState      = [];
	
	this.resultSet = [];
	this.cocktailsSet = [];
	
	
	this.initialize = function(filters, states, forceChange) {
		this.resultSet = this.cocktailsSet = Cocktail.cocktails.sort(DataFilter.nameSort);
		if(filters) this.filters = this.completeFilters(filters);
		
        this.strengthState = states && (states.length > 0) ? states[0] : this.strengths;
        this.tagState      = states && (states.length > 0) ? states[1] : this.tags;
        
		var ingredChanged = forceChange && (forceChange.indexOf("ingredient") > -1);
		view.initialize(this.tags, this.strengths, Cocktail.letters, this.ingredients, this.randomIngredient());
        this.applyFilters(!states && this.filters.strength, ingredChanged); // well..
	};
	
	this.randomIngredient = function(){
		var num = Math.floor((this.ingredients.length)*Math.random());
		return this.ingredients[num];
	};
	
	this.completeFilters = function(filters){
		if(!filters.letter)      filters.letter = "";
		if(!filters.tag)         filters.tag = "";
		if(!filters.strength)    filters.strength = "";
		if(!filters.ingredients) filters.ingredients = [];
		if(!filters.page)        filters.page = 0;
		return filters;
	};
	
	this.uniqueTags = function(){
		var res = [];
		for(var i = 0; i < this.resultSet.length; i++){
			res = res.concat(this.resultSet[i].tags);
		}
		return res.uniq();
	};
	
	this.uniqueStrengths = function(){
		var res = [];
		for(var i = 0; i < this.resultSet.length; i++){
			res.push(this.resultSet[i].strength);
		}
		return res.uniq();
	};
	
	this.onPageChanged = function(num){
		this.filters.page = num;
		view.controller.saveState(this.filters, this.tagState, this.strengthState);
	};
	
	this.onLetterFilter = function(name, name_all) { 
		if(name != this.filters.letter) {
			this.filters.ingredients = []; // reset
			this.filters.tag         = ""; // some
			this.filters.strength    = ""; // filters
			this.filters.page        = 0;  // page, too
			
			if(name != name_all) {
				this.filters.letter    = name;
			} else this.filters.letter = "";
			this.applyFilters(false, false, true);
		}
	};
	
	this.onTagFilter = function(name) { 
		if(name != this.filters.tag) {
			this.filters.letter = ""; // reset
			this.filters.tag    = name;  
		} else this.filters.tag  = "";
		this.filters.page = 0; // anyway
		this.applyFilters();
	};
	
	this.onStrengthFilter = function(name) {
		if(name != this.filters.strength) {
			this.filters.letter     = ""; // reset
			this.filters.strength   = name;
		} else this.filters.strength = "";
		this.filters.page = 0; // anyway
		this.filters.tag = "";
		this.applyFilters(true, false); 
	};
		
	this.onIngredientFilter = function(name, remove) {
		this.filters.letter = ""; // reset
		this.filters.page   = 0;  // anyway
	    this.filters.strength = "";
        this.filters.tag = "";

		var idx = this.filters.ingredients.indexOf(name);
		if(remove) {
			this.filters.ingredients.splice(idx, 1);
		} else if (idx == -1){
			this.filters.ingredients.push(name);
		} else return; // duplicate entry
		this.applyFilters(false, true);
	};

    this.updateStates = function(strengthChanged, ingredChanged, letterChanged) {
        if(letterChanged) {
            this.strengthState = this.strengths;
            this.tagState      = this.tags;
        }
        if(strengthChanged || ingredChanged) {
            this.tagState = this.uniqueTags();
        }
        if(ingredChanged) {
            this.strengthState = this.uniqueStrengths();
        }
    };

	this.applyFilters = function(strengthChanged, ingredChanged, letterChanged) {
		if(this.filters.letter || this.filters.tag || this.filters.strength || this.filters.ingredients) {
			this.resultSet = Cocktail.getByFilters(this.filters);
		}
		this.updateStates(strengthChanged, ingredChanged, letterChanged);
		view.onModelChanged(this.resultSet, this.filters, this.tagState, this.strengthState);
	}
}

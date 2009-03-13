function CocktailsModel (states, view) {
	this.resultSet = [];

	this.filters = {
		name        : "",
		letter      : "",
		tag         : "",
		strength    : "",
		ingredients : [],
		page        : 0,
		state		: states.defaultState
	},
	    
    // current subsets of strengths and tags
    this.strengthState = [];
    this.tagState      = [];
	
	this.resultSet = [];
	
	
	this.initialize = function(filters, tsStates, origin) {
		this.strengthState = tsStates && tsStates.length ? tsStates[0] : Cocktail.strengths;
        this.tagState      = tsStates && tsStates.length ? tsStates[1] : Cocktail.tags;
        if(filters) this.filters = this.completeFilters(filters, origin);
		
        view.initialize(Cocktail.tags, Cocktail.strengths, Cocktail.letters, Cocktail.ingredients, this.filters.state);
        this.applyFilters(!tsStates && this.filters.strength, !!this.filters.ingredients.length && origin == "request");
	};
	
	this.randomIngredient = function(){
		var num = Math.floor((Cocktail.ingredients.length)*Math.random());
		return Cocktail.ingredients[num];
	};
	
	this.randomCocktailNames = function(){
		var num = Math.floor((Cocktail.cocktails.length)*Math.random());
		var cocktail = Cocktail.cocktails[num];
		return [cocktail.name, cocktail.name_eng];
	}
	
	this.completeFilters = function(filters, origin){		
        if(!filters.name)          filters.name = "";
        if(!filters.letter)        filters.letter = "";
        if(!filters.tag)           filters.tag = "";
        if(!filters.strength)      filters.strength = "";
        if(!filters.page)          filters.page = 0;
        
        if(!filters.ingredients)   filters.ingredients = [];
        else if(filters.ingredients.split) filters.ingredients = filters.ingredients.split(",");
        
        if(!filters.state)  filters.state = states.defaultState
        else if(origin == "request") filters.state = states[filters.state] 
        
        if(filters.ingredients.length || filters.tag || filters.strength) {
          filters.state = states.byIngredients;
        }
        
        return filters;
	};
	
	this.resetFilters = function(){
	    this.filters.name = "";
	    this.filters.letter = "";
	    this.filters.tag = "";
	    this.filters.strength = "";
	    this.filters.ingredients = [];
	    this.filters.page = 0;
		this.filters.state = states.defaultState;
	}
	
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
	
	this.onStateChanged = function(state){
		this.resetFilters();
		this.filters.state = state;
		this.applyFilters(true, true, true, true);
	}
	
	this.onPageChanged = function(num){
		this.filters.page = num;
		view.controller.saveState(this.filters, this.tagState, this.strengthState);
	};
	
	
	this.onLetterFilter = function(name, name_all) { 
		if(name != this.filters.letter) {
			this.filters.ingredients = [];
			this.filters.tag         = "";
			this.filters.strength    = "";
			this.filters.page        = 0;
			
			if(name != name_all) {
				this.filters.letter    = name;
			} else this.filters.letter = "";
			this.applyFilters(false, false, true);
		}
	};
	
	this.onNameFilter = function(name) {
		if(name != this.filters.name) {
			this.filters.ingredients = [];
			this.filters.tag         = "";
			this.filters.strength    = "";
			this.filters.page        = 0;
			this.filters.name        = name; 
			this.applyFilters(false, false, false, true);
		}
	}
	
	this.onTagFilter = function(name) { 
		if(name != this.filters.tag) {
			this.filters.letter = "";
			this.filters.tag    = name; 
		} else this.filters.tag  = "";
		this.filters.page = 0;
		this.applyFilters();
	};
	
	this.onStrengthFilter = function(name) {
		if(name != this.filters.strength) {
			this.filters.letter     = "";
			this.filters.strength   = name;
		} else this.filters.strength = "";
		this.filters.page = 0;
		this.filters.tag = "";
		this.applyFilters(true, false); 
	};
		
	this.onIngredientFilter = function(name, remove) {
		this.filters.letter = "";
		this.filters.page   = 0;
	    this.filters.strength = "";
        this.filters.tag = "";
		
		var idx = this.filters.ingredients.indexOf(name);
		if (!name) { // removing all
			this.filters.ingredients = [];
		} else if (remove) {
			this.filters.ingredients.splice(idx, 1);
		} else if (idx == -1){
			this.filters.ingredients.push(name);
		} else return; // duplicate entry
		this.applyFilters(false, true);
	};

    this.updateStates = function(strengthChanged, ingredChanged, letterChanged, nameChanged) {
        if(letterChanged || nameChanged) {
            this.strengthState = Cocktail.strengths;
            this.tagState      = Cocktail.tags;
        }
        if(strengthChanged || ingredChanged) {
            this.tagState = this.uniqueTags();
        }
        if(ingredChanged) {
            this.strengthState = this.uniqueStrengths();
        }
    };

	this.applyFilters = function(strengthChanged, ingredChanged, letterChanged, nameChanged) {
        this.resultSet = Cocktail.getByFilters(this.filters);
        this.updateStates(strengthChanged, ingredChanged, letterChanged, nameChanged);
        view.onModelChanged(this.resultSet, this.filters, this.tagState, this.strengthState);
	}
}

function CocktailsModel (states, view) {
	this.resultSet = [];
	
	this.filters = {
		name:        "",
		letter:      "",
		tag:         "",
		strength:    "",
		ingredients: [],
		page:        0,
		state:       states.defaultState
	};
	
	this.resultSet = [];
	
	
	this.initialize = function(filters) {
		this.filters = this.completeFilters(filters);
		var viewData = {}
		
		viewData.ingredients = Ingredient.getAllNames()
		viewData.tags = Cocktail.getTags()
		viewData.strengths = Cocktail.getStrengths()
		viewData.methods = Cocktail.getMethods()
		
		viewData.letters = Cocktail.getFirstLetters()
		viewData.names = Ingredient.getAllSecondNames()
		viewData.byName = Ingredient.getNameBySecondNameHash()
		view.initialize(viewData, this.filters.state);
		this.applyFilters();
	};
	
	this.randomIngredient = function(){
		var allNames = Ingredient.getAllNames()
		var num = Math.floor((allNames.length)*Math.random());
		return allNames[num];
	};
	
	this.randomCocktailNames = function(){
		var cocktails = Cocktail.getAll()
		var num = Math.floor((cocktails.length)*Math.random());
		var cocktail = cocktails[num];
		return [cocktail.name, cocktail.name_eng];
	};
	
	this.completeFilters = function(filters){
		if(!filters)             filters = {};
		if(!filters.name)        filters.name = "";
		if(!filters.letter)      filters.letter = "";
		if(!filters.tag)         filters.tag = "";
		if(!filters.strength)    filters.strength = "";
		if(!filters.method)      filters.method = "";
		if(!filters.page)        filters.page = 0;
		if(!filters.ingredients) filters.ingredients = [];
		else if(filters.ingredients.split) filters.ingredients = filters.ingredients.split(",");
		
		if(!filters.state) filters.state = states.defaultState;
		
		if(filters.ingredients.length || filters.tag || filters.strength || filters.method) {
			filters.state = states.byIngredients;
		}
		
		return filters;
	};
	
	this.resetFilters = function(){
		this.filters.name = "";
		this.filters.letter = "";
		this.filters.tag = "";
		this.filters.strength = "";
		this.filters.method = "";
		this.filters.ingredients = [];
		this.filters.page = 0;
		this.filters.state = states.defaultState;
	};
	
	this.filtersAreEmpty = function(){
		return (!this.filters.name && !this.filters.letter &&
				!this.filters.tag && !this.filters.strength &&
				!this.filters.method && !this.filters.ingredients.length)
	};
	
	
	this.uniqueTags = function(set){
		var res = [];
		for(var i = 0; i < set.length; i++){ res = res.concat(set[i].tags) }
		return res.uniq();
	};
	
	this.uniqueStrengths = function(set){
		var res = [];
		for(var i = 0; i < set.length; i++){ res.push(set[i].strength) }
		return res.uniq();
	};

	this.uniqueMethods = function(set){
		var res = [];
		for(var i = 0; i < set.length; i++){ res.push(set[i].method) }
		return res.uniq();
	};

	this.onStateChanged = function(state){
		this.resetFilters();
		this.filters.state = state;
		this.applyFilters();
	}
	
	this.onPageChanged = function(num){
		this.filters.page = num;
		view.controller.saveFilters(this.filters);
	};
	
	this.onLetterFilter = function(name, name_all) {
		if(name != this.filters.letter) {
			this.filters.ingredients = [];
			this.filters.tag         = "";
			this.filters.strength    = "";
			this.filters.method      = "";
			this.filters.page        = 0;
			
			if(name != name_all) {
				this.filters.letter    = name;
			} else this.filters.letter = "";
			this.applyFilters();
		}
	};
	
	this.onNameFilter = function(name) {
		if(name != this.filters.name) {
			this.filters.ingredients = [];
			this.filters.tag         = "";
			this.filters.strength    = "";
			this.filters.method      = "";
			this.filters.page        = 0;
			this.filters.name        = name;
			this.applyFilters();
		}
	}
	
	this.onTagFilter = function(name) {
		if(name != this.filters.tag) {
			this.filters.letter  = "";
			this.filters.tag     = name;
		} else this.filters.tag  = "";
		this.filters.method = "";
		this.filters.page = 0;
		this.applyFilters();
	};
	
	this.onStrengthFilter = function(name) {
		if(name != this.filters.strength) {
			this.filters.letter      = "";
			this.filters.strength    = name;
		} else this.filters.strength = "";
		this.filters.page = 0;
		this.filters.tag = "";
		this.filters.method = "";
		this.applyFilters();
	};
	
	this.onMethodFilter = function(name) {
		if(name != this.filters.method) {
			this.filters.letter  = "";
			this.filters.method  = name;
		} else this.filters.method = "";
		this.filters.page = 0;
		this.applyFilters();
	};	

	this.onIngredientFilter = function(name, remove) {
		this.filters.letter   = "";
		this.filters.page     = 0;
		this.filters.strength = "";
		this.filters.tag      = "";
		this.filters.method   = "";
		
		var idx = this.filters.ingredients.indexOf(name);
		if (!name) { // removing all
			this.filters.ingredients = [];
		} else if (remove) {
			this.filters.ingredients.splice(idx, 1);
		} else if (idx == -1){
			this.filters.ingredients.push(name);
		} else return; // duplicate entry
		this.applyFilters();
	};
	
	// get states by current filters
	this.getGroupStates = function(){
		var set = [], groupStates = {};
		
		if (this.filtersAreEmpty())
		{
			var res = {}
			res.tags = Cocktail.getTags()
			res.strengths = Cocktail.getStrengths()
			res.methods = Cocktail.getMethods()
		}
		
		// strengths state - depends only on ingredients
		var rFilters = cloneObject(this.filters);
		rFilters.strength = "", rFilters.tag  = "", rFilters.method = "";
		groupStates.strengths = this.uniqueStrengths(this.getCocktailsByFilters(rFilters, states));
		
		// tags state - depends on ingredients and strength
		rFilters = cloneObject(this.filters);
		rFilters.tag = "", rFilters.method = "";
		groupStates.tags = this.uniqueTags(this.getCocktailsByFilters(rFilters, states));
		
		// methods state - depends on ingredients, strength and tag
		rFilters = cloneObject(this.filters);
		rFilters.method = "";
		groupStates.methods = this.uniqueMethods(this.getCocktailsByFilters(rFilters, states));
		
		return groupStates;
	};
	
	this.getCocktailsByFilters = function (filters, states)
	{
		var res = null
		
		if (filters.name)
			return Cocktail.getBySimilarName(filters.name)
		
		if (filters.letter)
			return Cocktail.getByLetter(filters.letter)
		
		if (filters.tag)
			res = Cocktail.getByTag(filters.tag)
		
		if (filters.strength)
			res = Cocktail.getByStrength(filters.strength, res)
		
		if (filters.method)
			res = Cocktail.getByMethod(filters.method, res)
		
		if (filters.marks && filters.marks.length)
		{
			var marks = filters.marks, ingredients = []
			for (var i = 0; i < marks.length; i++)
				ingredients.push(Ingredient.getByMark(marks[i]))
			
			// concat all the ingredients in one native operation just like SIMD ;)
			ingredients = Array.prototype.concat.apply([], ingredients)
			log(ingredients)
			res = Cocktail.getByIngredients(ingredients, res, 1)
			log(res)
		}
		
		if (filters.ingredients && filters.ingredients.length)
			res = Cocktail.getByIngredientNames(filters.ingredients, res)
		
		if (!res)
		{
			if (filters.state == states.byName)
				res = Cocktail.getAll().shuffled()
			else
				res = Cocktail.getAll().sortedBy(Cocktail.nameSort)
		}
		
		return res
	}
	
	
	this.applyFilters = function()
	{
		var filters = this.filters
		
		var names = filters.ingredients
		if (names)
		{
			var plain = [], marks = [], markToken = 'марка '
			for (var i = 0; i < names.length; i++)
			{
				var name = names[i]
				if (name.indexOf(markToken) == 0)
					marks.push(name.substr(markToken.length))
				else
					plain.push(name)
			}
			filters.ingredients = plain
			filters.marks = marks
		}
		view.onModelChanged(this.getCocktailsByFilters(filters, states), filters, this.getGroupStates());
	};
}

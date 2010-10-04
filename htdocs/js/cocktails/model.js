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
		
		if (!filters.marks)
			filters.marks = []
		else if (filters.marks.split)
			filters.marks = filters.marks.split(',')
		
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
		this.filters.marks = []
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
				Statistics.cocktailsFilterSelected(name)
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
			Statistics.cocktailsFilterSelected(name)
		} else this.filters.tag  = "";
		this.filters.method = "";
		this.filters.page = 0;
		this.applyFilters();
	};
	
	this.onStrengthFilter = function(name) {
		if(name != this.filters.strength) {
			this.filters.letter      = "";
			this.filters.strength    = name;
			Statistics.cocktailsFilterSelected(name)
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
			Statistics.cocktailsFilterSelected(name)
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
		
		if (!name) // removing all
		{
			this.filters.ingredients = []
			this.filters.marks = []
			this.applyFilters()
			return
		}
		
		var idx = this.filters.marks.indexOf(name)
		if (idx >= 0)
		{
			this.filters.marks.splice(idx, 1)
			this.applyFilters()
			return
		}
		
		var ingredient = Ingredient.getByNameCI(name)
		if (!ingredient)
			return
		
		var idx = this.filters.ingredients.indexOf(ingredient.name);
		if (remove) {
			this.filters.ingredients.splice(idx, 1);
		} else if (idx == -1){
			this.filters.ingredients.push(ingredient.name);
			Statistics.ingredientTypedIn(ingredient)
		} else return; // duplicate entry
		this.applyFilters();
	};
	
	this.onMarkAddFilter = function (name)
	{
		var idx = this.filters.marks.indexOf(name)
		if (idx < 0)
		{
			this.filters.marks.push(name)
			this.applyFilters()
			return
		}
	}
	
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
	
	var getBySimilarNameCache = {},
		allCocktails = Cocktail.getAll()
	this.getBySimilarName = function (name)
	{
		if (getBySimilarNameCache[name])
			return getBySimilarNameCache[name]
			
		var words = name.split(/\s+/),
			res = [], db = allCocktails
		
		for (var i = 0; i < words.length; i++)
			words[i] = new RegExp('(?:^|\\s|-)' + RegExp.escape(words[i]), 'i')
		
		var first = words[0], jl = words.length
		SEARCH: for (var i = 0; i < db.length; i++)
		{
			var cocktail = db[i], name
			
			if (first.test(cocktail.name))
				name = cocktail.name
			else if (first.test(cocktail.name_eng))
				name = cocktail.name_eng
			else
				continue SEARCH
			
			for (var j = 1; j < jl; j++)
				if (!words[j].test(name))
					continue SEARCH
			
			res.push(cocktail)
		}
		return (getBySimilarNameCache[name] = res)
	},
	
	
	this.getCocktailsByFilters = function (filters, states)
	{
		var res = null
		
		if (filters.name)
			return this.getBySimilarName(filters.name)
		
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
			res = Cocktail.getByIngredients(ingredients, {db: res, count: 1})
		}
		
		if (filters.ingredients && filters.ingredients.length)
			res = Cocktail.getByIngredientNames(filters.ingredients, {db: res})
		
		if (!res)
		{
			if (filters.state == states.byName)
				res = Cocktail.getAll().shuffled()
			else if (filters.state == states.byIngredients)
				res = Cocktail.getAll().sortedBy(Cocktail.complexitySort)
			else
				res = Cocktail.getAll().sortedBy(Cocktail.nameSort)
		}
		
		return res
	}
	
	
	this.applyFilters = function()
	{
		var filters = this.filters
		view.onModelChanged(this.getCocktailsByFilters(filters, states), filters, this.getGroupStates());
	};
}

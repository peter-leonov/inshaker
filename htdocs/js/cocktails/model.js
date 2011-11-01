;(function(){

var lettersConversion =
{
	0: '#', 1: '#', 2: '#', 3: '#', 4: '#', 5: '#', 6: '#', 7: '#', 8: '#', 9: '#', '№': '#',
	'ё': 'е', 'й': 'и'
}

Object.extend(Cocktail,
{
	getByFirstLetter: function (letter)
	{
		return this.index.byFirstLetter[letter.toLowerCase()]
	},
	
	getFirstLetters: function ()
	{
		function byFirstLetter (v)
		{
			var letter = v.name.charAt(0).toLowerCase()
			var l = lettersConversion[letter]
			return l || letter
		}
		var index = this.index.byFirstLetter = DB.hashOfAryIndexBy(this.db, byFirstLetter)
		
		var letters = []
		for (var k in index)
			letters.push(k)
		
		return letters.sort()
	}
})

// deep copy using JSON lib ;-)
function cloneObject(obj){
	return JSON.parse(JSON.stringify(obj));
}

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
		viewData.tags = Cocktail.getGroups()
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
	
	this.uniqueTags = function (cocktails)
	{
		return DB.hashIndexByAryKey(cocktails, 'tags')
	}
	
	this.uniqueStrengths = function (cocktails)
	{
		return DB.hashIndexByAryKey(cocktails, 'tags')
	}
	
	this.uniqueMethods = function (cocktails)
	{
		return DB.hashIndexByAryKey(cocktails, 'tags')
	}

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
		var groupStates = {strengths: {}, tags: {}, methods: {}}
		
		if (filters.state == states.byName)
		{
			if (filters.name)
			{
				var res = this.getBySimilarName(filters.name)
				return {cocktails: res, groupStates: groupStates}
			}
			
			var res = Cocktail.getAll()
			res.randomize()
			return {cocktails: res, groupStates: groupStates}
		}
		
		if (filters.state == states.byLetter)
		{
			if (filters.letter)
			{
				var res = Cocktail.getByFirstLetter(filters.letter)
				return {cocktails: res, groupStates: groupStates}
			}
			
			var res = Cocktail.getAll()
			return {cocktails: res, groupStates: groupStates}
		}
		
		
		// “by ingredients” state
		
		var res = Cocktail.getAll()
		
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
		
		var lastStates = groupStates.strengths = DB.hashIndexByAryKey(res, 'tags')
		
		if (filters.strength)
		{
			var set = Cocktail.getByTag(Cocktail.getTagByTagCI(filters.strength))
			res = DB.intersection([res, set])
			
			lastStates = groupStates.tags = DB.hashIndexByAryKey(res, 'tags')
		}
		else
			groupStates.tags = lastStates
		
		
		if (filters.tag)
		{
			var set = Cocktail.getByTag(Cocktail.getTagByTagCI(filters.tag))
			res = DB.intersection([res, set])
			
			groupStates.methods = DB.hashIndexByAryKey(res, 'tags')
		}
		else
			groupStates.methods = lastStates
		
		
		if (filters.method)
		{
			var set = Cocktail.getByTag(Cocktail.getTagByTagCI(filters.method))
			res = DB.intersection([res, set])
		}
		
		res.sort(Cocktail.complexitySort)
		return {cocktails: res, groupStates: groupStates}
	}
	
	
	this.applyFilters = function()
	{
		var filters = this.filters
		var res = this.getCocktailsByFilters(filters, states)
		view.onModelChanged(res.cocktails, filters, res.groupStates)
	};
}

self.CocktailsModel = CocktailsModel

})();
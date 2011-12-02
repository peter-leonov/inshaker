;(function(){

var lettersConversion =
{
	0: '#', 1: '#', 2: '#', 3: '#', 4: '#', 5: '#', 6: '#', 7: '#', 8: '#', 9: '#', '№': '#',
	'ё': 'е', 'й': 'и'
}

Object.extend(Cocktail,
{
	indexByFirstLetter: function ()
	{
		if (this.index.byFirstLetter)
			return
		
		function byFirstLetter (v)
		{
			var letter = v.name.charAt(0).toLowerCase()
			var l = lettersConversion[letter]
			return l || letter
		}
		this.index.byFirstLetter = DB.hashOfAryIndexBy(this.db, byFirstLetter)
	},
	
	getByFirstLetterPrepare: function ()
	{
		this.indexByFirstLetter()
	},
	
	getByFirstLetter: function (letter)
	{
		return this.index.byFirstLetter[letter.toLowerCase()]
	},
	
	getFirstLettersPrepare: function ()
	{
		this.indexByFirstLetter()
	},
	
	getFirstLetters: function ()
	{
		var letters = Object.keys(this.index.byFirstLetter)
		letters.sort()
		return letters
	}
})

Cocktail.findAndBindPrepares()

function CocktailsModel (states, view) {
	this.resultSet = [];
	
	this.initialize = function (filters)
	{
		this.filters = this.completeFilters(filters)
		
		view.renderLetters(Cocktail.getFirstLetters())
		view.turnToState(this.filters.state)
		
		this.applyFilters()
	}
	
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
		if(!filters.page)        filters.page = 0;
		
		if (!filters.state)
			filters.state = states.defaultState;
		
		return filters;
	};
	
	this.resetFilters = function(){
		this.filters.name = "";
		this.filters.letter = "";
		this.filters.page = 0;
		this.filters.state = states.defaultState;
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
			this.filters.page        = 0;
			this.filters.name        = name;
			this.applyFilters();
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
		if (filters.state == states.byName)
		{
			if (filters.name)
			{
				var res = this.getBySimilarName(filters.name)
				return {cocktails: res}
			}
			
			var res = Cocktail.getAll()
			res.randomize()
			return {cocktails: res}
		}
		
		if (filters.state == states.byLetter)
		{
			if (filters.letter)
			{
				var res = Cocktail.getByFirstLetter(filters.letter)
				return {cocktails: res}
			}
			
			var res = Cocktail.getAll()
			return {cocktails: res}
		}
	}
	
	
	this.applyFilters = function()
	{
		var filters = this.filters
		var res = this.getCocktailsByFilters(filters, states)
		view.onModelChanged(res.cocktails, filters)
	};
}

self.CocktailsModel = CocktailsModel

})();
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

function Me () {}

Me.prototype =
{
	setFilters: function (filters)
	{
		this.completeFilters(filters || {})
		
		this.view.renderLetters(Cocktail.getFirstLetters())
		this.view.turnToState(this.filters.state)
		
		this.applyFilters()
	},
	
	randomCocktailNames: function(){
		var cocktails = Cocktail.getAll()
		var num = Math.floor((cocktails.length)*Math.random());
		var cocktail = cocktails[num];
		return [cocktail.name, cocktail.name_eng];
	},
	
	completeFilters: function (filters)
	{
		this.filters =
		{
			name: filters.name || '',
			letter: filters.letter || '*',
			page: filters.page || 0,
			state: filters.state || 'byName'
		}
	},
	
	setState: function (state)
	{
		this.view.turnToState(state)
		this.completeFilters({})
		this.filters.state = state
		this.applyFilters()
	},
	
	onPageChanged: function(num){
		this.filters.page = num;
		this.view.saveFilters(this.filters);
	},
	
	onLetterFilter: function(letter)
	{
		if (letter == this.filters.letter)
			return
		
		Statistics.cocktailsFilterSelected(letter)
		
		this.filters.page        = 0;
		this.filters.letter = letter
		this.applyFilters()
	},
	
	onNameFilter: function(name) {
		if(name != this.filters.name) {
			this.filters.page        = 0;
			this.filters.name        = name;
			this.applyFilters();
		}
	},
	
	getBySimilarNameCache: {},
	getBySimilarName: function (name)
	{
		if (this.getBySimilarNameCache[name])
			return this.getBySimilarNameCache[name]
			
		var words = name.split(/\s+/),
			res = [], db = Cocktail.getAll()
		
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
		return (this.getBySimilarNameCache[name] = res)
	},
	
	
	getCocktailsByFilters: function (filters)
	{
		if (filters.state == 'byName')
		{
			if (filters.name)
				return this.getBySimilarName(filters.name)
			
			var res = Cocktail.getAll()
			res.randomize()
			return res
		}
		
		if (filters.state == 'byLetter')
		{
			if (filters.letter == '*')
				return Cocktail.getAll()
			
			if (filters.letter)
				return Cocktail.getByFirstLetter(filters.letter)
		}
	},
	
	
	applyFilters: function()
	{
		var filters = this.filters
		var res = this.getCocktailsByFilters(filters)
		this.view.onModelChanged(res, filters)
	}
}

Papa.Model = Me

})();
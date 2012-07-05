;(function(){

Cocktail.findAndBindPrepares()

function Me () {}

Me.prototype =
{
	getRandomCocktail: function ()
	{
		return Cocktail.getAll().random(1)[0]
	},
	
	onPageChanged: function(num){
		this.filters.page = num;
		this.view.saveFilters(this.filters);
	},
	
	onNameFilter: function (name)
	{
		if (name == this.filters.name)
			return
		
		this.filters.name = name
		this.filters.page = 0
		this.applyFilters()
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
		if (filters.name)
			return this.getBySimilarName(filters.name)
		
		var res = Cocktail.getAll()
		res.randomize()
		return res
	},
	
	applyFilters: function()
	{
		this.filters = this.filters || {}

		this.filters =
		{
			name: this.filters.name || '',
			page: this.filters.page || 0
		}
		
		var filters = this.filters
			
		var res = this.getCocktailsByFilters(filters)
		this.view.onModelChanged(res, filters)
		this.view.renderRandomCocktail(this.getRandomCocktail())
	}
}

Papa.Model = Me

})();
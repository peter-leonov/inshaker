;(function(){

Cocktail.findAndBindPrepares()

function Me ()
{
	this.state = null
	this.getBySimilarNameCache = {}
}

Me.prototype =
{
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
	
	getCocktailsByState: function (state)
	{
		if (state)
			return this.getBySimilarName(state)
		
		var res = Cocktail.getAll()
		res.randomize()
		return res
	},
	
	setRandomCocktail: function ()
	{
		var cocktail = Cocktail.getAll().random(1)[0]
		this.view.renderRandomCocktail(cocktail)
	},
	
	setState: function (state)
	{
		if (this.state == state)
			return
		
		this.state = state
		
		this.result = this.getIterator(this.getCocktailsByState(state))
		
		this.addNewCocktails()
	},
	
	addMoreCocktails: function ()
	{
		var view = this.view
		function render (cocktails, left)
		{
			view.renderMoreCocktails(cocktails, left)
		}
		this.result(this.cocktailsPerPage, render)
	},
	
	addNewCocktails: function ()
	{
		var view = this.view
		function render (cocktails, left)
		{
			if (cocktails.length == 0)
			{
				view.notHaveCocktails()
				return
			}
			
			view.renderNewCocktails(cocktails, left)
		}
		this.result(this.cocktailsPerPage, render)
	},
	
	setCocktailsPerPage: function (count)
	{
		this.cocktailsPerPage = count
	},
	
	getIterator: function (all)
	{
		var start = 0
		function iterator (count, callback)
		{
			var items = all.slice(start, start + count)
			start += count
			
			function call (e)
			{
				callback(items, all.length - start)
			}
			window.setTimeout(call, 0)
		}
		
		return iterator
	}
}

Papa.Model = Me

})();
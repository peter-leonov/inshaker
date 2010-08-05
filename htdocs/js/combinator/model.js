;(function(){

Array.prototype.hashValues = function ()
{
	var hash = {}
	for (var i = 0, il = this.length; i < il; i++)
		hash[this[i]] = true
	return hash
}

var Papa = CombinatorPage, Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.ds = {}
		this.state = {}
		this.searcheCache = {}
		
		this.sortByNames =
		[
			'от простых к сложным',
			'от сложных к простым',
			'по алфавиту',
			'по группам'
			// 'по дате размещения'
		]
		
		this.sortTypeByNum =
		[
			'increasing-complexity',
			'decreasing-complexity',
			'alphabetically',
			'by-group'
			// 'by-date'
		]
		
		this.sortBy = 'increasing-complexity'
	},
	
	bind: function (ds)
	{
		this.ds = ds
		
		var ingredients = ds.ingredient.getAllNames(),
			secondNames = ds.ingredient.getAllSecondNames(),
			secondNamesHash = ds.ingredient.getNameBySecondNameHash()
		
		var set = ingredients.slice()
		set.push.apply(set, secondNames)
		set.sort()
		
		var searcher = new IngredientsSearcher(set, secondNamesHash)
		this.view.setCompleterDataSource(searcher)
		
		this.view.renderSortby(this.sortByNames)
	},
	
	updateData: function ()
	{
		var add = this.add,
			remove = this.remove
		
		
		if (!add.length && !remove.length)
		{
			this.view.renderCocktails(null)
			return
		}
		
		var cocktails = this.getCocktailsByIngredients(add, remove)
		
		var sorted
		switch (this.sortBy)
		{
			case 'increasing-complexity':
				sorted = this.sortByIncreasingComplexity(cocktails)
			break
			
			case 'decreasing-complexity':
				sorted = this.sortByDecreasingComplexity(cocktails)
			break
			
			case 'alphabetically':
				sorted = this.sortAlphabetically(cocktails)
			break
			
			case 'by-group':
				sorted = this.sortByGroup(cocktails)
			break
		}
		
		// oowf, need to update the view
		this.view.renderCocktails(sorted)
	},
	
	sortByIncreasingComplexity: function (cocktails)
	{
		cocktails = cocktails.slice()
		cocktails.sort(function (a, b) { return a.ingredients.length - b.ingredients.length })
		return [{cocktails: cocktails}]
	},
	
	sortByDecreasingComplexity: function (cocktails)
	{
		cocktails = cocktails.slice()
		cocktails.sort(function (a, b) { return b.ingredients.length - a.ingredients.length })
		return [{cocktails: cocktails}]
	},
	
	sortAlphabetically: function (cocktails)
	{
		cocktails.sort(function (a, b) { return a.name.localeCompare(b.name) })
		return [{cocktails: cocktails}]
	},
	
	sortByGroup: function (cocktails)
	{
		var byTag = {}
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			
			var tags = cocktail.tags
			for (var j = 0, jl = tags.length; j < jl; j++)
			{
				var tag = tags[j]
				
				var arr = byTag[tag]
				if (arr)
					arr.push(cocktail)
				else
					byTag[tag] = [cocktail]
			}
		}
		
		var groups = []
		for (var k in byTag)
			groups.push({name: k, cocktails: byTag[k]})
		
		return groups
	},
	
	setIngredientsNames: function (add, remove)
	{
		add = this.filtRealIngredients(add)
		remove = this.filtRealIngredients(remove)
		
		this.add = add
		this.remove = remove
		
		this.updateData()
	},
	
	setSortBy: function (typeNum)
	{
		this.sortBy = this.sortTypeByNum[typeNum]
		
		this.updateData()
	},
	
	
	getCocktailsByIngredients: function (add, remove)
	{
		var key = add.join(':') + '::' + remove.join(':')
		
		// look up the cache
		var cocktails = this.searcheCache[key]
		if (!cocktails)
			cocktails = this.searcheCache[key] = this.searchCocktails(add, remove)
		
		return cocktails
	},
	
	searchCocktails: function (add, remove)
	{
		var set = this.ds.cocktail.getByIngredientNames(add)
		
		if (!remove.length)
			return set
		
		remove = remove.hashValues()
		
		var cocktails = []
		cocktails: for (var i = 0, il = set.length; i < il; i++)
		{
			var cocktail = set[i],
				recipe = cocktail.ingredients
			
			for (var j = 0, jl = recipe.length; j < jl; j++)
			{
				if (remove[recipe[j][0]])
					continue cocktails
			}
			
			cocktails.push(cocktail)
		}
		
		return cocktails
	},
	
	filtRealIngredients: function (arr)
	{
		var Ingredient = this.ds.ingredient
		
		var res = [], seen = {}
		for (var i = 0, il = arr.length; i < il; i++)
		{
			var ingredient = Ingredient.getByNameCI(arr[i])
			if (!ingredient)
				continue
			
			var name = ingredient.name
			if (seen[name])
				continue
			
			seen[name] = true
			
			res.push(name)
		}
		return res
	},
	
	setState: function (state)
	{
		this.state = state
		
		// var cocktails = this.ds.cocktail.getByIngredientNames(['Малина'])
		// cocktails.sort(function (a, b) { return a.ingredients.length - b.ingredients.length })
		// this.view.renderCocktails(cocktails)
	}
}

Object.extend(Me.prototype, myProto)

})();
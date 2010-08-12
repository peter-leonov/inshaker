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
			'по алфавиту',
			'по группам',
			'по дате размещения',
			'по количеству ингредиента'
		]
		
		this.sortTypeByNum =
		[
			'increasing-complexity',
			'alphabetically',
			'by-group',
			'by-date',
			'by-strength'
		]
		
		this.sortBy = this.sortTypeByNum[0]
	},
	
	bind: function (ds)
	{
		this.ds = ds
		
		var ingredients = ds.ingredient.getAllNames(),
			secondNames = ds.ingredient.getAllSecondNames(),
			secondNamesHash = ds.ingredient.getNameBySecondNameHash(),
			tags = ds.ingredient.getTags()
		
		var set = ingredients.slice()
		set.push.apply(set, secondNames)
		set.push.apply(set, tags)
		set.sort()
		
		var searcher = new IngredientsSearcher(set, secondNamesHash)
		this.view.setCompleterDataSource(searcher)
		
		this.view.renderSortbyOptions(this.sortByNames)
		this.view.renderSortby(this.sortTypeByNum.indexOf(this.sortBy))
		
		var tagsHash = this.tagsHash = {}
		for (var i = 0, il = tags.length; i < il; i++)
			tagsHash[tags[i].toLowerCase()] = true
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
			
			case 'alphabetically':
				sorted = this.sortAlphabetically(cocktails)
			break
			
			case 'by-group':
				sorted = this.sortByGroup(cocktails)
			break
			
			case 'by-date':
				sorted = this.sortByDate(cocktails)
			break
			
			case 'by-strength':
				sorted = this.sortByStrength(cocktails, add)
			break
		}
		
		// oowf, need to update the view
		this.view.renderCocktails(sorted, cocktails.length)
	},
	
	sortByIncreasingComplexity: function (cocktails)
	{
		cocktails = cocktails.slice()
		cocktails.sort(function (a, b) { return a.ingredients.length - b.ingredients.length || a.tools.length - b.tools.length || a.name.localeCompare(b.name) })
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
		
		var tags = this.ds.cocktail.tags,
			sorted = []
		for (var i = 0, il = tags.length; i < il; i++)
		{
			var tag = tags[i]
			if (byTag[tag])
				sorted.push(tag)
		}
		
		var groups = []
		for (var i = 0, il = sorted.length; i < il; i++)
		{
			var tag = sorted[i]
			groups.push({name: tag, cocktails: byTag[tag]})
		}
		
		return groups
	},
	
	sortByDate: function (cocktails)
	{
		cocktails.sort(function (a, b) { return b.added - a.added })
		
		var groups = []
		
		var currentKey = 0, month = null
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			
			var added = new Date(cocktail.added * 1000)
			
			var key = added.getFullYear() * 100 + added.getMonth()
			if (key == currentKey)
			{
				month.push(cocktail)
				continue
			}
			
			currentKey = key
			month = [cocktail]
			groups.push({date: added, cocktails: month})
		}
		
		return groups
	},
	
	sortByStrength: function (cocktails, add)
	{
		var kByIngredient = {}
		for (var i = 0, il = add.length; i < il; i++)
			kByIngredient[add[i]] = 1 / (i * 1000 + 1)
		
		var weightByName = {}
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			
			var weight = 0// , total = 0
			
			var parts = cocktail.ingredients
			for (var j = 0, jl = parts.length; j < jl; j++)
			{
				var part = parts[j]
				
				var volume = parseFloat(part[1])
				// total += volume
				
				var k = kByIngredient[part[0]]
				if (!k)
					continue
				
				weight += k * parseFloat(part[1])
			}
			
			weightByName[cocktail.name] = weight // / total
		}
		
		cocktails.sort(function (a, b) { return weightByName[b.name] - weightByName[a.name] })
		
		return [{cocktails: cocktails}]
	},
	
	setIngredientsNames: function (add, remove)
	{
		add = this.expandIngredients(add)
		remove = this.expandIngredients(remove)
		
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
		var set = this.complexSearchIngredients(add)
		
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
	
	complexSearchIngredients: function (set)
	{
		var Cocktail = this.ds.cocktail,
			cocktails
		
		var groups = [], ingredients = []
		for (var i = 0, il = set.length; i < il; i++)
		{
			var item = set[i]
			
			if (item.constructor == Array)
				groups.push(item)
			else
				ingredients.push(item)
		}
		
		var firstGroup = 0
		if (ingredients.length)
		{
			// reduce cocktails set by raw ingredients
			cocktails = Cocktail.getByIngredientNames(ingredients)
		}
		else if (groups.length)
		{
			// reduce cocktails set by first ingredients group
			cocktails = Cocktail.getByIngredientNames(group[0], {count: 1})
			firstGroup = 1
		}
		
		// step by step reducing with other groups
		for (var i = firstGroup, il = groups.length; i < il; i++)
			cocktails = Cocktail.getByIngredientNames(groups[i], {db: cocktails, count: 1})
		
		return cocktails
	},
	
	expandIngredients: function (arr)
	{
		var Ingredient = this.ds.ingredient
		
		var res = [], seen = {}, tagsHash = this.tagsHash
		for (var i = 0; i < arr.length; i++)
		{
			var name = arr[i]
			
			if (tagsHash[name.toLowerCase()])
			{
				var group = Ingredient.getByTagCI(name)
				
				var names = []
				for (var j = 0, jl = group.length; j < jl; j++)
				{
					var n = group[j].name
					
					if (seen[n])
						continue
					seen[n] = true
					
					names.push(n)
				}
				
				res.push(names)
				continue
			}
			
			var ingredient = Ingredient.getByNameCI(name)
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
	}
}

Object.extend(Me.prototype, myProto)

})();
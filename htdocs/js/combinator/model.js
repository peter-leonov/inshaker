;(function(){

Array.prototype.hashValues = function (hash)
{
	if (!hash)
		hash = {}
	for (var i = 0, il = this.length; i < il; i++)
		hash[this[i]] = true
	return hash
}

Array.prototype.flatten = function ()
{
	var res = [], push = this.push
	for (var i = 0, il = this.length; i < il; i++)
	{
		var item = this[i]
		if (item.constructor == Array)
			push.apply(res, item.flatten())
		else
			res.push(item)
	}
	return res
}

var Papa = CombinatorPage, Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.ds = {}
		this.state = {}
		this.searchCache = {}
		
		this.sortByNames =
		[
			'от простых к сложным',
			'по алфавиту',
			'по группам',
			'по дате размещения'
			// 'по количеству ингредиента'
		]
		
		this.sortTypeByNum =
		[
			'increasing-complexity',
			'alphabetically',
			'by-group',
			'by-date'
			// 'by-strength'
		]
		
		this.sortBy = this.sortTypeByNum[0]
	},
	
	bind: function (ds)
	{
		this.ds = ds
		
		var ingredients = ds.ingredient.getAllNames(),
			secondNames = ds.ingredient.getAllSecondNames(),
			secondNamesHash = ds.ingredient.getNameBySecondNameHash(),
			ingredientsTags = ds.ingredient.getTags(),
			cocktailsTags = ds.cocktail.getTags()
		
		var set = ingredients.slice()
		set.push.apply(set, secondNames)
		set.push.apply(set, ingredientsTags)
		set.push.apply(set, cocktailsTags)
		set.sort()
		
		var searcher = this.searcher = new IngredientsSearcher(set, secondNamesHash)
		this.view.setCompleterDataSource(searcher)
		
		this.view.renderSortbyOptions(this.sortByNames)
		this.view.renderSortby(this.sortTypeByNum.indexOf(this.sortBy))
		
		var favorites = searcher.favorites = {}
		
		var ingredientsTagsHash = this.ingredientsTagsHash = {}
		for (var i = 0, il = ingredientsTags.length; i < il; i++)
		{
			var tag = ingredientsTags[i]
			ingredientsTagsHash[tag.toLowerCase()] = true
			favorites[tag] = true
		}
		
		var cocktailsTagsHash = this.cocktailsTagsHash = {}
		for (var i = 0, il = cocktailsTags.length; i < il; i++)
		{
			var tag = cocktailsTags[i]
			cocktailsTagsHash[tag.toLowerCase()] = true
			favorites[tag] = true
		}
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
		
		var cocktails = this.getCocktailsByQuery(add, remove)
		
		if (cocktails.length == 0)
		{
			this.view.renderCocktails(cocktails, 0)
			this.suggestSome(add, remove)
			return
		}
		
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
		
		var letter, group, res = []
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			
			var l = cocktail.name.charAt(0)
			
			if (l == letter)
			{
				group.push(cocktail)
				continue
			}
			
			letter = l
			group = [cocktail]
			res.push({cocktails: group, name: letter})
		}
		
		return res
	},
	
	sortByGroup: function (cocktails)
	{
		var byGroup = {}
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			
			var groups = cocktail.groups
			for (var j = 0, jl = groups.length; j < jl; j++)
			{
				var group = groups[j]
				
				var arr = byGroup[group]
				if (arr)
					arr.push(cocktail)
				else
					byGroup[group] = [cocktail]
			}
		}
		
		var groups = this.ds.cocktail.getGroups(),
			sorted = []
		for (var i = 0, il = groups.length; i < il; i++)
		{
			var group = groups[i]
			if (byGroup[group])
				sorted.push(group)
		}
		
		var groups = []
		for (var i = 0, il = sorted.length; i < il; i++)
		{
			var group = sorted[i]
			groups.push({name: group, cocktails: byGroup[group]})
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
	
	combine: function (arr)
	{
		var res = [], seen = {}, total = 0
		
		res.push(arr.slice())
		if (arr.length == 1)
			return res
		
		function walk (a)
		{
			total++
			
			for (var i = a.length - 1; i >= 0; i--)
			{
				
				var v = a.slice()
				v.splice(i, 1)
				
				var s = ''+v
				if (seen[s])
					continue
				seen[s] = true
				
				res.push(v)
				
				if (v.length == 1)
					continue
				
				walk(v)
			}
		}
		
		walk(arr)
		
		return res
	},
	
	suggestSome: function (add, remove)
	{
		var suggestions = []
		
		var combinatios = this.combine(add)
		combinatios.sort(function (a, b) { return b.length - a.length })
		
		for (var i = 0, il = combinatios.length -1 ; i < il; i++)
		{
			var query = combinatios[i]
			
			var set = this.getCocktailsByQuery(query, [])
			if (set.length)
				suggestions.push({add: this.collapseQueryObjects(query), count: set.length})
		}
		
		this.view.renderSuggestions(suggestions)
	},
	
	setQuery: function (add, remove)
	{
		add = this.expandQueryNames(add)
		remove = this.expandQueryNames(remove)
		
		this.setDuplicates(add, remove)
		
		
		this.add = add
		this.remove = remove
		
		this.updateData()
	},
	
	quickQueryChange: function (add, remove)
	{
		add = this.expandQueryNames(add)
		remove = this.expandQueryNames(remove)
		
		this.setDuplicates(add, remove)
	},
	
	setDuplicates: function (add, remove)
	{
		var duplicates = this.searcher.duplicates = {}
		this.hashDuplicates(add, duplicates)
		this.hashDuplicates(remove, duplicates)
	},
	
	hashDuplicates: function (arr, hash)
	{
		for (var i = 0, il = arr.length; i < il; i++)
		{
			var item = arr[i],
				type = item.type
			
			hash[item] = true
			
			if (type == 'ingredient-tag')
			{
				var tag = item.valueOf(),
					names = item.names
				for (var j = 0, jl = names.length; j < jl; j++)
					hash[names[j]] = tag
				continue
			}
		}
	},
	
	setSortBy: function (typeNum)
	{
		this.sortBy = this.sortTypeByNum[typeNum]
		
		this.updateData()
	},
	
	
	getCocktailsByQuery: function (add, remove)
	{
		var key = add.join(':') + '::' + remove.join(':')
		
		// look up the cache
		var cocktails = this.searchCache[key]
		if (!cocktails)
			cocktails = this.searchCache[key] = this.searchCocktails(add, remove)
		
		return cocktails
	},
	
	searchCocktails: function (add, remove)
	{
		var Cocktail = this.ds.cocktail
		
		var cocktails = Cocktail.getAll()
		
		for (var i = 0, il = add.length; i < il; i++)
		{
			var item = add[i],
				type = item.type
			
			if (type == 'ingredient')
			{
				cocktails = Cocktail.getByIngredientNames([item.valueOf()], {db: cocktails})
				continue
			}
			
			if (type == 'ingredient-tag')
			{
				cocktails = Cocktail.getByIngredientNames(item.names, {db: cocktails, count: 1})
				continue
			}
			
			if (type == 'cocktail-tag')
			{
				cocktails = Cocktail.getByTags([item], {db: cocktails, count: 1})
				continue
			}
		}
		
		// yes, needs refactoring
		for (var i = 0, il = remove.length; i < il; i++)
		{
			var item = remove[i],
				type = item.type
			
			if (type == 'ingredient')
			{
				cocktails = Cocktail.getByIngredientNames([item.valueOf()], {db: cocktails}).rest
				continue
			}
			
			if (type == 'ingredient-tag')
			{
				cocktails = Cocktail.getByIngredientNames(item.names, {db: cocktails, count: 1}).rest
				continue
			}
			
			if (type == 'cocktail-tag')
			{
				cocktails = Cocktail.getByTags([item], {db: cocktails, count: 1}).rest
				continue
			}
		}
		
		return cocktails
	},
	
	collapseQueryObjects: function (arr)
	{
		var names = []
		
		for (var i = 0, il = arr.length; i < il; i++)
			names[i] = arr[i].valueOf()
		
		return names
	},
	
	expandQueryNames: function (arr)
	{
		var Ingredient = this.ds.ingredient
		
		var ingredientsTagsHash = this.ingredientsTagsHash,
			cocktailsTagsHash = this.cocktailsTagsHash
		
		var res = [], seen = {}
		for (var i = 0; i < arr.length; i++)
		{
			var item = arr[i]
			
			if (seen[item])
				continue
			seen[item] = true
			
			if (ingredientsTagsHash[item.toLowerCase()])
			{
				var name = new String(item)
				name.type = 'ingredient-tag'
				var names = name.names = []
				
				var group = Ingredient.getByTagCI(item)
				for (var j = 0, jl = group.length; j < jl; j++)
					names[j] = group[j].name
				
				res.push(name)
				continue
			}
			
			if (cocktailsTagsHash[item.toLowerCase()])
			{
				var name = new String(item)
				name.type = 'cocktail-tag'
				res.push(name)
				continue
			}
			
			var ingredient = Ingredient.getByNameCI(item)
			if (ingredient)
			{
				var name = new String(ingredient.name)
				name.type = 'ingredient'
				res.push(name)
				continue
			}
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
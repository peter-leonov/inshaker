;(function(){

var Papa = CombinatorPage, Me = Papa.Model

function DefaultState (state)
{
	for (var k in state)
	{
		var v = state[k]
		if (v !== undefined)
			this[k] = v
	}
}
DefaultState.prototype =
{
	sortBy: 'increasing-complexity'
}
Me.DefaultState = DefaultState

var myProto =
{
	sortByNames:
	[
		'от простых к сложным',
		'по дате размещения',
		'по группам',
		'по методу приготовления',
		'по алфавиту'
		// 'по количеству ингредиента'
	],
	
	sortTypeByNum:
	[
		'increasing-complexity',
		'by-date',
		'by-group',
		'by-method',
		'alphabetically'
		// 'by-strength'
	],
	
	initialize: function ()
	{
		this.ds = {}
		this.searchCache = {}
		
		this.state = new DefaultState()
	},
	
	bind: function ()
	{
		var ingredientsTags = Ingredient.getTags(),
			cocktailsTags = Cocktail.getTags()
		
		this.view.renderSortbyOptions(this.sortByNames)
		this.view.renderSortby(this.sortTypeByNum.indexOf(this.state.sortBy))
		
		var favorites = {}
		
		var ingredientsTagsHash = this.ingredientsTagsHash = {}
		for (var i = 0, il = ingredientsTags.length; i < il; i++)
		{
			var tag = ingredientsTags[i]
			ingredientsTagsHash[tag.toLowerCase()] = tag
			favorites[tag] = true
		}
		
		var cocktailsTagsHash = this.cocktailsTagsHash = {}
		for (var i = 0, il = cocktailsTags.length; i < il; i++)
		{
			var tag = cocktailsTags[i]
			cocktailsTagsHash[tag.toLowerCase()] = tag
			favorites[tag] = true
		}
		
		this.setupSearcher(favorites, ingredientsTags, cocktailsTags)
	},
	
	setupSearcher: function (favorites, ingredientsTags, cocktailsTags)
	{
		var ingredients = Ingredient.getAll()
		
		var set = [], bySecondName = {}
		for (var i = 0, il = ingredients.length; i < il; i++)
		{
			var ingredient = ingredients[i],
				name = ingredient.name
			
			set.push(name)
			
			var snames = ingredient.names
			if (!snames)
				continue
			
			for (var j = 0, jl = snames.length; j < jl; j++)
			{
				var sname = snames[j]
				set.push(sname)
				bySecondName[sname] = name
			}
		}
		
		set.push.apply(set, ingredientsTags)
		set.push.apply(set, cocktailsTags)
		set.sort()
		
		var searcher = this.searcher = new IngredientsSearcher(set, bySecondName, favorites)
		this.view.setCompleterDataSource(searcher)
	},
	
	updateData: function ()
	{
		var state = this.state,
			add = state.add,
			remove = state.remove
		
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
		switch (state.sortBy)
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
			
			case 'by-method':
				sorted = this.sortByMethod(cocktails)
			break
			
			case 'by-date':
				sorted = this.sortByDate(cocktails)
			break
			
			case 'by-strength':
				sorted = this.sortByStrength(cocktails, add)
			break
		}
		
		var stats = this.calculateStats(cocktails)
		
		// oowf, need to update the view
		this.view.renderCocktails(sorted, cocktails.length, stats)
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
		cocktails.sort(Cocktail.complexitySort)
		
		return this.sortByTags(cocktails, Cocktail.getGroups())
	},
	
	sortByMethod: function (cocktails)
	{
		cocktails.sort(Cocktail.complexitySort)
		
		return this.sortByTags(cocktails, Cocktail.getMethods())
	},
	
	sortByTags: function (cocktails, tags)
	{
		var byTag = DB.hashOfAryIndexByAryKey(cocktails, 'tags')
		
		var sorted = []
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
		cocktails.sort(Cocktail.addedSort)
		
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
				
				var volume = part[1]
				// total += volume
				
				var k = kByIngredient[part[0]]
				if (!k)
					continue
				
				weight += k * volume
			}
			
			weightByName[cocktail.name] = weight // / total
		}
		
		cocktails.sort(function (a, b) { return weightByName[b.name] - weightByName[a.name] })
		
		return [{cocktails: cocktails}]
	},
	
	calculateStats: function (cocktails)
	{
		var rating = {}
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var parts = cocktails[i].ingredients
			for (var j = 0, jl = parts.length; j < jl; j++)
			{
				var name = parts[j][0]
				var count = rating[name]
				if (count)
					rating[name]++
				else
					rating[name] = 1
			}
		}
		
		var all = Object.keys(rating)
		all.sort(function (a, b) { return rating[b] - rating[a] })
		all = all.slice(0, 7)
		
		var top = []
		for (var i = 0, il = all.length; i < il; i++)
		{
			var name = all[i]
			
			top[i] =
			{
				ingredient: Ingredient.getByName(name),
				rating: rating[name]
			}
		}
		
		return {top: top}
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
		
		var begin = +new Date()
		for (var i = 0, il = combinatios.length; i < il; i++)
		{
			var query = combinatios[i]
			
			var set = this.getCocktailsByQuery(query, [])
			if (set.length)
				suggestions.push({add: this.collapseQueryObjects(query), count: set.length})
			
			if (i % 25 == 0 && new Date() - begin > 250)
				break
		}
		
		this.view.renderSuggestions(suggestions)
	},
	
	setState: function (newState)
	{
		this.statView(newState.add, newState.remove)
		
		var add = this.expandQueryNames(newState.add)
		var remove = this.expandQueryNames(newState.remove)
		
		this.setDuplicates(add, remove)
		
		var state = this.state = new DefaultState(newState)
		state.add = add
		state.remove = remove
		
		this.updateData()
		
		this.view.renderQuery(state.query)
		this.lastQuery = state.query
		
		if (state.sortBy)
			this.view.renderSortby(this.sortTypeByNum.indexOf(state.sortBy))
		
		this.view.scrollTo(+state.scrollTop || 0)
		
		if (state.ingredientPopup)
		{
			var ingredient = Ingredient.getByName(state.ingredientPopup)
			this.view.showIngredient(ingredient)
		}
		else
			this.view.showIngredient(null)
	},
	
	setQuery: function (add, remove, query)
	{
		if (query === this.lastQuery)
			return
		this.lastQuery = query
		
		this.statSearch(query)
		this.statView(add, remove)
		
		add = this.expandQueryNames(add)
		remove = this.expandQueryNames(remove)
		
		this.setDuplicates(add, remove)
		
		var state = this.state
		state.add = add
		state.remove = remove
		state.query = query
		
		state.scrollTop = 0
		this.view.scrollTo(state.scrollTop)
		
		this.updateData()
		
		this.view.setBookmark(state)
	},
	
	queryChanged: function (add, remove)
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
		var state = this.state
		
		state.sortBy = this.sortTypeByNum[typeNum]
		
		this.view.setBookmark(state)
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
		var ingredientsTagsHash = this.ingredientsTagsHash,
			cocktailsTagsHash = this.cocktailsTagsHash
		
		var res = [], seen = {}
		for (var i = 0; i < arr.length; i++)
		{
			var item = arr[i]
			
			if (seen[item])
				continue
			seen[item] = true
			
			var tag = ingredientsTagsHash[item.toLowerCase()]
			if (tag)
			{
				var name = new String(tag)
				name.type = 'ingredient-tag'
				var names = name.names = []
				
				var group = Ingredient.getByTag(tag)
				for (var j = 0, jl = group.length; j < jl; j++)
					names[j] = group[j].name
				
				res.push(name)
				continue
			}
			
			var tag = cocktailsTagsHash[item.toLowerCase()]
			if (tag)
			{
				var name = new String(tag)
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
	
	updateAllIngredients: function ()
	{
		var ingredients = this.allIngredients
		if (ingredients)
			return
		
		Ingredient.calculateEachIngredientUsage()
		ingredients = this.allIngredients = Ingredient.getAll()
		
		var groups = this.groupByGroup(ingredients)
		this.sortGoupsBy(groups, this.sortByUsage)
		
		this.view.renderInitialBlock(groups)
	},
	
	groupByGroup: function (all)
	{
		var groups = Ingredient.getGroups()
		
		var data = []
		{
			var slices = {}
			for (var i = 0; i < groups.length; i++)
			{
				var list = [], name = groups[i]
				slices[name] = list
				data.push({name: name, list: list})
			}
			
			for (var i = 0; i < all.length; i++)
			{
				var ingred = all[i]
				slices[ingred.group].push(ingred)
			}
		}
		return data
	},
	
	sortGoupsBy: function (data, func)
	{
		for (var i = 0; i < data.length; i++)
			data[i].list.sort(func)
	},
	
	sortByUsage: function (a, b) { return b.cocktails.length - a.cocktails.length },
	
	updateExamples: function ()
	{
		var examples = this.guessExamples() || [['водка'], ['водка', 'сок']]
		this.view.renderExamples(examples)
	},
	
	guessExamples: function ()
	{
		var base = this.chooseExampleIngredient(),
			baseName = base.name
		
		var coefficients = Ingredient.defaultSupplementCoefficients()
		var supplements = Ingredient.getByNames(Cocktail.getSupplementNamesByIngredientName(baseName, coefficients))
		if (supplements.length == 0)
			return
		
		var names = []
		
		// collect “main” tags from all ingredients
		for (var i = 0, il = supplements.length; i < il; i++)
		{
			var supplement = supplements[i]
			
			// names.push(supplement.name)
			
			var tags = supplement.tags
			if (tags.length >= 2)
				names.push(tags[0])
		}
		
		var second = names.random(1)[0]
		return [[baseName], [baseName, second]]
	},
	
	chooseExampleIngredient: function ()
	{
		var ingredients = Ingredient.getByTag('Сочетайзер')
		if (ingredients.length)
			return ingredients.random(1)[0]
		
		var ingredients = Ingredient.getByGroup('Крепкий алкоголь')
		Ingredient.calculateEachIngredientUsage()
		ingredients.sort(this.sortByUsage)
		return ingredients.slice(0, 8).random(1)[0]
	},
	
	selectIngredient: function (ingredient)
	{
		var state = this.state
		
		if (ingredient)
		{
			state.ingredientPopup = ingredient.name
			this.view.showIngredient(ingredient)
		}
		else
		{
			delete state.ingredientPopup
			this.view.showIngredient(null)
		}
		
		this.view.setBookmark(state)
	},
	
	setScrollTop: function (v)
	{
		this.state.scrollTop = v
	},
	
	statSearch: function (query)
	{
		if (/\S/.test(query))
			Statistics.combinatorQueryRaw(query)
	},
	
	statView: function (add, remove)
	{
		if (!add.length && !remove.length)
			return
		
		var lowerAdd = []
		for (var i = 0, il = add.length; i < il; i++)
			lowerAdd[i] = add[i].toLowerCase()
		lowerAdd.sort()
		
		var lowerRemove = []
		for (var i = 0, il = remove.length; i < il; i++)
			lowerRemove[i] = remove[i].toLowerCase()
		lowerRemove.sort()
		
		var query = lowerAdd.join(' + ')
		if (lowerRemove.length)
			query += ' - ' + lowerRemove.join(' - ')
		
		Statistics.combinatorQueryViewed(query)
	}
}

Object.extend(Me.prototype, myProto)

})();
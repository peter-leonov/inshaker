;(function(){

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

Array.prototype.uniqString = function uniqString ()
{
	var res = []
	
	var seen = {}
	for (var i = 0, il = this.length; i < il; i++)
	{
		var v = this[i]
		
		if (seen[v])
			continue
		seen[v] = true
		
		res.push(v)
	}
	
	return res
}

Array.prototype.joinA = function joinA (o)
{
	var l = this.length
	
	if (l == 0)
		return []
	
	var res = [this[0]]
	
	for (var i = 1; i < l; i++)
	{
		res.push(o)
		res.push(this[i])
	}
	
	return res
}


function Me ()
{
	this.ds = {}
	this.searchCache = {}
  // this.hideGroups = {}
	
	this.state = new DefaultState()
}

Me.prototype =
{
	sortByNames:
	[
		'от простых к сложным',
		'по дате размещения',
		'по группам',
		'по методу приготовления',
		'по алфавиту'
	],
	
	sortTypeByNum:
	[
		'increasing-complexity',
		'by-date',
		'by-group',
		'by-method',
		'alphabetically'
	],
	
	bind: function (exceptGroups)
	{
		this.exceptGroups = exceptGroups
		
    // var hideGroups = this.hideGroups
    // var groups = Ingredient.getGroups()
    // for (var i = 0, il = groups.length; i < il; i++)
    // {
    //  var group = groups[i]
    //  if (Ingredient.getGroupOfGroup(group) != 'ingredients')
    //    hideGroups[group] = true
    // }
		
		this.view.renderSortbyOptions(this.sortByNames)
		this.view.renderSortby(this.sortTypeByNum.indexOf(this.state.sortBy))
		
		this.setupSearcher()
	},
	
	setupSearcher: function ()
	{
		var cocktails = Cocktail.toNames(Cocktail.getAll())
		
		var bySecondName = {}
		
		var ingredients = Ingredient.getAll()
		for (var i = 0, il = ingredients.length; i < il; i++)
		{
			var ingredient = ingredients[i],
				name = ingredient.name
			
			ingredients[i] = name
			
			var snames = ingredient.names
			if (!snames)
				continue
			
			for (var j = 0, jl = snames.length; j < jl; j++)
				bySecondName[snames[j]] = name
		}
		
		
		var ingredientsTags = Ingredient.getTags(),
			cocktailsTags = Cocktail.getTags()
		
		// favorites are all the tags
		var favorites = {}
		
		for (var i = 0, il = ingredientsTags.length; i < il; i++)
			favorites[ingredientsTags[i]] = true
		
		for (var i = 0, il = cocktailsTags.length; i < il; i++)
			favorites[cocktailsTags[i]] = true
		
		
		// integrate
		var set = [].concat(ingredients, cocktails, ingredientsTags, cocktailsTags, Object.keys(bySecondName))
		
		set.sort()
		set = set.uniqString()
		
		
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
		cocktails.sort(Cocktail.sortByComplexity)
		
		return this.sortByTags(cocktails, Cocktail.getGroups())
	},
	
	sortByMethod: function (cocktails)
	{
		cocktails.sort(Cocktail.sortByComplexity)
		
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
		cocktails.sort(Cocktail.sortByAddTime)
		
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
	
	combine: function (arr)
	{
		var res = []
		
		res.push(arr.slice())
		if (arr.length == 1)
			return res
		
		var seen = {}
		function walk (a)
		{
			for (var i = a.length - 1; i >= 0; i--)
			{
				var v = a.slice()
				v.splice(i, 1)
				
				var s = '' + v
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
				suggestions.push({add: query, count: set.length})
			
			if (i % 25 == 0 && new Date() - begin > 250)
				break
		}
		
		this.view.renderSuggestions(suggestions)
	},
	
	setState: function (newState)
	{
		this.statView(newState.add, newState.remove)
		
		var add = newState.add
		var remove = newState.remove
		
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
		
		var state = this.state
		state.add = add
		state.remove = remove
		state.query = query
		
		state.scrollTop = 0
		this.view.scrollTo(state.scrollTop)
		
		this.updateData()
		
		this.view.setBookmark(state)
		
		window.localStorage.setItem('combinatorSearched', 1)
	},
	
	queryChanged: function (add, remove)
	{
		// do nothing
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
		// remove logic has been removed ;)
		
		for (var i = 0, il = add.length; i < il; i++)
			add[i] = Cocktail.guessEntityCI(add[i])
		
		return Cocktail.getByQuery(add.joinA('&'))
	},
	
	updateAllIngredients: function ()
	{
		if (this.allIngredientsUpdated)
			return
		this.allIngredientsUpdated = true
		
		var ingredients = Ingredient.getAll()
		ingredients.sort(Cocktail.sortIngredientsByUsage())
		
		var groups = this.groupByGroup(ingredients)
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
				
        // if (this.hideGroups[name])
        //  continue
				
				if (this.exceptGroups.indexOf(name) == -1)
					;//name += ' <a href="/registration/" class="link">покупай по карте клуба друзей и барменов Inshaker</a>'
				
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
	
	updateExample: function ()
	{
		var example = this.guessExample() || ['водка', 'сок']
		this.view.renderExample(example)
	},
	
	guessExample: function ()
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
		return [baseName, second]
	},
	
	chooseExampleIngredient: function ()
	{
		var ingredients = Ingredient.getByTag('Сочетайзер')
		if (ingredients.length)
			return ingredients.random(1)[0]
		
		var ingredients = Ingredient.getByGroup('Крепкий алкоголь')
		ingredients.sort(Cocktail.sortIngredientsByUsage())
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

Papa.Model = Me

})();

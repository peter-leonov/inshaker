;(function(){

eval(NodesShortcut.include())

function Me (data)
{
	for (var k in data)
		this[k] = data[k]
}

Me.prototype =
{
	pageHref: function () { return '/ingredient/' + this.path + '/' },
	getMiniImageSrc: function () { return this.pageHref() + 'preview.jpg' },
	getMainImageSrc: function () { return this.getVolumeImage(this.volumes[0]) },
	cocktailsLink: function () { return '/cocktails.html#state=byIngredients&ingredients=' + encodeURIComponent(this.name) },
	combinatorLink: function () { return '/combinator.html#q=' + encodeURIComponent(this.name) },
	
	loadLocalData: function (f)
	{
		var ingredient = this
		function merge (data)
		{
			Object.add(ingredient, data)
			f.call(ingredient)
		}
		
		return require(this.pageHref() + 'data.json', merge)
	},
	
	getVolumeImage: function (vol)
	{
		return this.pageHref() + 'image.png'
	},
	
	getPreviewNode: function ()
	{
		var node = Nc('a', 'ingredient-preview')
		var image = Nc('div', 'image')
		image.style.backgroundImage = 'url(' + this.getMiniImageSrc() + ')'
		node.appendChild(image)
		
		var name = Nct('span', 'name', this.name)
		node.appendChild(name)
		
		node['data-ingredient'] = this
		
		return node
	},
	
	getPreviewNodeLazy: function ()
	{
		var node = Nc('a', 'ingredient-preview lazy')
		var image = Nc('div', 'image')
		node.appendChild(image)
		
		var name = Nct('span', 'name', this.name)
		node.appendChild(name)
		
		node['data-ingredient'] = this
		
		var ingredient = this
		node.unLazy = function ()
		{
			image.style.backgroundImage = 'url(' + ingredient.getMiniImageSrc() + ')'
			this.removeClassName('lazy')
		}
		
		return node
	},
	
	getCost: function (anount)
	{
		var best = this.volumes[0]
		return anount * best[1] / best[0]
	}
}

Me.staticMethods =
{
	db: null,
	groups: null,
	tags: null,
	
	initialize: function (db, groups, tags)
	{
		this.db = db
		this.groups = groups
		this.tags = tags
		
		var groupOrder = this.groupOrder = {}
		for (var i = 0, il = groups.length; i < il; i++)
			groupOrder[groups[i]] = i
		
		for (var i = 0, il = db.length; i < il; i++)
			db[i] = new Me(db[i])
	},
	
	getAll: function ()
	{
		return this.db.slice()
	},
	
	getGroups: function ()
	{
		return this.groups.slice()
	},
	
	getTags: function ()
	{
		return this.tags.slice()
	},
	
	getByName: function (name)
	{
		if (!this._byName)
			this._updateByNameIndex()
		
		return this._byName[name]
	},
	
	getByNameCI: function (name)
	{
		if (!this._byName)
			this._updateByNameIndex()
		
		if (!this._nameByNameCI)
			this._updateNameByNameCIIndex()
		
		return this._byName[this._nameByNameCI[name.toLowerCase()]]
	},
	
	getByTag: function (name)
	{
		if (!this._byTag)
			this._updateByTagIndex()
		
		return this._byTag[name] || []
	},
	
	getByNames: function (names)
	{
		if (!this._byName)
			this._updateByNameIndex()
		
		var res = []
		
		var byName = this._byName
		for (var i = 0, il = names.length; i < il; i++)
			res[i] = byName[names[i]]
		
		return res
	},
	
	// rarely used simple search
	getByGroup: function (group)
	{
		var res = []
		
		var db = this.db
		for (var i = 0, il = db.length; i < il; i++)
		{
			var ingredient = db[i]
			if (ingredient.group == group)
				res.push(ingredient)
		}
		
		return res
	},
	
	getByGroups: function (groups)
	{
		var hash = DB.hashIndex(groups)
		
		var db = this.db,
			res = []
		for (var i = 0, il = db.length; i < il; i++)
		{
			var ingredient = db[i]
			if (hash[ingredient.group])
				res.push(ingredient)
		}
		
		return res
	},
	
	calculateEachIngredientUsage: function ()
	{
		if (this.eachIngredientUsageCalculated)
			return
		this.eachIngredientUsageCalculated = true
		
		var cocktails = Cocktail.getCocktailsByIngredientNameHash(),
			db = this.db
		
		for (var i = 0, il = db.length; i < il; i++)
		{
			var ingred = db[i]
			ingred.cocktails = cocktails[ingred.name] || []
		}
	},
	
	_updateByNameIndex: function ()
	{
		var db = this.db,
			byName = this._byName = {}
		
		for (var i = 0; i < db.length; i++)
		{
			var ingred = db[i]
			byName[ingred.name] = ingred
		}
	},
	
	_updateNameByNameCIIndex: function ()
	{
		var db = this.db,
			_nameByNameCI = this._nameByNameCI = {}
		
		for (var i = 0; i < db.length; i++)
		{
			var name = db[i].name
			_nameByNameCI[name.toLowerCase()] = name
		}
	},
	
	_updateByTagIndex: function ()
	{
		var db = this.db,
			index = this._byTag = {}
		
		for (var i = 0; i < db.length; i++)
		{
			var ingred = db[i]
			
			var tags = ingred.tags
			for (var j = 0, jl = tags.length; j < jl; j++)
			{
				var tag = tags[j]
				
				var arr = index[tag]
				if (arr)
					arr.push(ingred)
				else
					index[tag] = [ingred]
			}
		}
	},
	
	_updateByMarkIndex: function ()
	{
		var db = this.db,
			byMark = this._byMark = {}
		
		for (var i = 0; i < db.length; i++)
		{
			var ingred = db[i],
				mark = ingred.mark
			
			if (mark)
			{
				var arr
				if ((arr = byMark[mark]))
					arr.push(ingred)
				else
					byMark[mark] = [ingred]
			}
		}
	},
	
	
	getByMark: function (mark)
	{
		if (!this._byMark)
			this._updateByMarkIndex()
		
		return this._byMark[mark]
	},
	
	ingredientsLinkByMark: function (mark)
	{
		return '/cocktails.html#state=byIngredients&marks=' + encodeURIComponent(mark)
	},
	
	mergeIngredientSets: function ()
	{
		var res = [],
			byName = {}
		
		for (var i = 0, il = arguments.length; i < il; i++)
		{
			var set = arguments[i]
			
			for (var j = 0, jl = set.length; j < jl; j++)
			{
				var part = set[j],
					name = part[0]
				
				var sum = byName[name]
				if (sum)
					sum[1] += part[1]
				else
				{
					sum = [name, part[1], part[2]]
					byName[name] = sum
					res.push(sum)
				}
			}
		}
		
		return res
	},
	
	compareByGroup: function (a, b)
	{
		var groupOrder = Me.groupOrder
		return groupOrder[a.group] - groupOrder[b.group]
	},
	
	defaultSupplementCoefficients: function ()
	{
		// try to use cached coefficients
		var coefficients = this._supplementCoefficients
		if (coefficients)
			return coefficients
		
		// need to compute new ones
		coefficients = this._supplementCoefficients = {}
		
		// you can see hard-coded values, sorry
		var major = this.getByGroups(['Соки и морсы', 'Вода и напитки'])
		for (var i = 0, il = major.length; i < il; i++)
			coefficients[major[i].name] = 1
		
		var minor = this.getByGroups(['Лед']).concat(this.getByNames(['Сахарный сироп', 'Лайм', 'Лимон']))
		for (var i = 0, il = minor.length; i < il; i++)
			coefficients[minor[i].name] = 0.001
		
		return coefficients
	}
}

Object.extend(Me, DB.module.staticMethods)
Object.extend(Me, Me.staticMethods)
Me.findAndBindPrepares()

Me.className = 'Ingredient'
self[Me.className] = Me

Me.initialize
(
	<!--# include virtual="/db/ingredients/ingredients.json"-->,
	<!--# include virtual="/db/ingredients/groups.json"-->,
	<!--# include virtual="/db/ingredients/tags.json"-->
)

})();
;(function(){

eval(NodesShortcut.include())

function Me (data)
{
	this.name    = data.name
	this.screen  = data.screen
	this.names   = data.names
	
	this.path    = data.path
	
	this.group   = data.group
	this.tags    = data.tags || []
	
	this.brand   = data.brand
	this.mark    = data.mark
	
	this.unit    = data.unit
	this.volumes = data.volumes
	this.inShop = data.inShop
}

Me.prototype =
{
	pageHref: function () { return '/ingredient/' + this.path + '/' },
	getMiniImageSrc: function () { return this.pageHref() + 'preview.jpg' },
	getMainImageSrc: function () { return this.getVolumeImage(this.volumes[0]) },
	cocktailsLink: function () { return '/cocktails.html#state=byIngredients&ingredients=' + encodeURIComponent(this.name) },
	combinatorLink: function () { return '/combinator.html#q=' + encodeURIComponent(this.name) },
	screenName: function () { return this.screen || this.name },
	
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
		
		var name = Nct('span', 'name', this.screenName())
		node.appendChild(name)
		
		node['data-ingredient'] = this
		
		return node
	},
	
	getPreviewNodeLazy: function ()
	{
		var node = Nc('a', 'ingredient-preview lazy')
		var image = Nc('div', 'image')
		node.appendChild(image)
		
		var name = Nct('span', 'name', this.screenName())
		node.appendChild(name)
		
		node['data-ingredient'] = this
		
		var ingredient = this
		node.unLazy = function ()
		{
			image.style.backgroundImage = 'url(' + ingredient.getMiniImageSrc() + ')'
			this.classList.remove('lazy')
		}
		
		return node
	},
	
	getBrandedName: function ()
	{
		var mark = this.mark
		if (mark)
			return this.name + ' ' + mark
		
		return this.name
	}
}

Me.staticMethods =
{
	db: null,
	groups: null,
	tags: null,
	
	index: {},
	
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
	
	getByNamePrepare: function ()
	{
		this.index.byName = DB.hashIndexKey(this.db, 'name')
	},
	
	getByName: function (name)
	{
		return this.index.byName[name]
	},
	
	getByNameCIPrepare: function ()
	{
		function lowercase (ingredient)
		{
			return ingredient.name.toLowerCase()
		}
		
		this.index.byNameCI = DB.hashIndexBy(this.db, lowercase)
	},
	
	getByNameCI: function (name)
	{
		return this.index.byNameCI[name.toLowerCase()]
	},
	
	getByTagPrepare: function ()
	{
		var index = DB.hashOfAryIndexByAryKey(this.db, 'tags')
		index['Любой ингредиент'] = this.db.slice()
		
		this.index.byTag = index
	},
	
	getByTag: function (name)
	{
		return this.index.byTag[name] || []
	},
	
	getByNames: function (names)
	{
		var res = []
		
		for (var i = 0, il = names.length; i < il; i++)
			res[i] = this.getByName(names[i])
		
		return res
	},
	
	getByGroupPrepare: function ()
	{
		this.index.byGroup = DB.hashOfAryIndexByKey(this.db, 'group')
	},
	
	getByGroup: function (group)
	{
		return this.index.byGroup[group] || []
	},
	
	getByGroups: function (groups)
	{
		var res = []
		for (var i = 0, il = groups.length; i < il; i++)
			res[i] = this.getByGroup(groups[i])
		
		return DB.disjunction(res)
	},
	
	getByMarkPrepare: function ()
	{
		this.index.byMark = DB.hashOfAryIndexByKey(this.db, 'mark')
	},
	
	getByMark: function (mark)
	{
		return this.index.byMark[mark] || []
	},
	
	ingredientsLinkByMark: function (mark)
	{
		return '/combinator.html#q=' + encodeURIComponent(mark)
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
	},
	
	// you can see hard-coded values, sorry again
	groupsOfGroups: {'Украшения': 'tools', 'Штучки': 'tools', 'Посуда': 'tools', 'Штуковины': 'things'},
	getGroupOfGroup: function (group)
	{
		return this.groupsOfGroups[group] || 'ingredients'
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
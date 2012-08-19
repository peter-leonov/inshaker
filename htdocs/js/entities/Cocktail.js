;(function(){

function Me (data)
{
	for (var k in data)
		this[k] = data[k]
}

Me.prototype =
{
	bake: function ()
	{
		if (this._baked)
			return this
		this._baked = true
		
		var parts = Ingredient.mergeIngredientSets(this.ingredients, this.garnish)
		
		for (var i = 0, il = parts.length; i < il; i++)
		{
			var part = parts[i]
			
			parts[i] =
			{
				ingredient: Ingredient.getByName(part[0]),
				dose: part[1]
			}
		}
		
		this.parts = parts
		
		return this
	},
	
	screenName: function () { return this.screen || this.name },
	
	getPath: function ()
	{
		var path = this._path
		if (path)
			return path
		
		path = this._path = '/cocktail/' + this.name_eng.htmlName() + '/'
		return path
	},
	
	getBigImageSrc: function ()
	{
		var htmlName = this.name_eng.htmlName(),
			path = '/cocktail/' + htmlName
		
		return path + '/' + htmlName + '-big.png'
	},
	
	getBigCroppedImageSrc: function ()
	{
		var htmlName = this.name_eng.htmlName(),
			path = '/cocktail/' + htmlName
		
		return path + '/' + htmlName + '-big-cropped.png'
	},
	
	getPreviewNode: function (lazy, big)
	{
		var htmlName = this.name_eng.htmlName(),
			path = '/cocktail/' + htmlName
		
		var li = document.createElement('li')
		li.className = lazy ? 'cocktail-preview lazy' : 'cocktail-preview'
		
		var a = document.createElement('a')
		a.className = 'link'
		a.href = path + '/'
		li.appendChild(a)
		
		var img = li.img = document.createElement("img")
		img.className = 'image'
		img[lazy ? 'lazySrc' : 'src'] = path + '/' + htmlName + (big ? '-big.png' : '-small.png')
		a.appendChild(img)
		
		var name = this.screenName()
		var txt = document.createTextNode(name)
		a.appendChild(txt)
		
		return li
	},
	
	getLinkImage: function (lazy, big)
	{
		var htmlName = this.name_eng.htmlName(),
			path = '/cocktail/' + htmlName
		
		var a = document.createElement('a')
		a.className = 'link'
		a.href = path + '/'

		var img = document.createElement("img")
		img.className = 'image'
		img[lazy ? 'lazySrc' : 'src'] = path + '/' + htmlName + (big ? '-big.png' : '-small.png')
		a.appendChild(img)
		
		return a
	},
	
	getPreviewNodeCropped: function ()
	{
		var htmlName = this.name_eng.htmlName(),
			path = '/cocktail/' + htmlName
		
		var a = document.createElement('a')
		a.className = 'cocktail-preview'
		a.href = path + '/'
		
		var imageBox = document.createElement('span')
		imageBox.className = 'image-box'
		a.appendChild(imageBox)
		
		var img = a.img = document.createElement('img')
		img.className = 'image'
		var dx = this.dx
		if (dx)
			img.style.left = dx + 'px'
		img.src = path + '/' + htmlName + '-small-cropped.png'
		imageBox.appendChild(img)
		
		var name = document.createElement('span')
		name.className = 'name'
		a.appendChild(name)
		
		var str = this.screenName()
		name.appendChild(document.createTextNode(str))
		
		return a
	},
	
	getLinkNodeBig: function (lazy) { return this.getPreviewNode(lazy, true) },
	
	getIngredientNames: function ()
	{
		var names = []
		
		var parts = this.ingredients
		for (var i = 0, il = parts.length; i < il; i++)
			names[i] = parts[i][0]
		
		return names
	},
	
	getPlurals: function ()
	{
		var cart = this.cart
		if (cart)
			return cart.plural
		
		return ['порция', 'порции', 'порций']
	}
}

Me.staticMethods =
{
	index: {},
	letters: [],
	
	initialize: function (hash, groups, strengths, methods, tags)
	{
		this.groups = groups
		this.strengths = strengths
		this.methods = methods
		this.tags = tags
		
		var byName = this.byName = {},
			names = []
		
		for (var k in hash)
			names.push(k)
		names.sort()
		
		var db = []
		for (var i = 0, il = names.length; i < il; i++)
		{
			var name = names[i]
			var cocktail = new Me(hash[name])
			db[i] = byName[name] = cocktail
			cocktail._oid = i
		}
		
		this.db = db
	},
	
	bakeAry: function (ary)
	{
		for (var i = 0, il = ary.length; i < il; i++)
			ary[i].bake()
		return ary
	},
	
	getGroups: function () { return this.groups.slice() },
	getStrengths: function () { return this.strengths.slice() },
	getMethods: function () { return this.methods.slice() },
	getTags: function () { return this.tags.slice() },
	
	getTagByTagCIPrepare: function ()
	{
		function lowercase (tag)
		{
			return tag.toLowerCase()
		}
		this.index.tagByTagCI = DB.hashIndexBy(this.tags, lowercase)
	},
	
	getTagByTagCI: function (tag)
	{
		return this.index.tagByTagCI[tag.toLowerCase()]
	},
	
	getByNameCIPrepare: function ()
	{
		function lowercase (cocktail)
		{
			return cocktail.name.toLowerCase()
		}
		this.index.byNameCI = DB.hashIndexBy(this.db, lowercase)
	},
	
	getByNameCI: function (name)
	{
		return this.index.byNameCI[name.toLowerCase()]
	},
	
	getAll: function()
	{
		return this.db.slice()
	},
	
	getByName: function (name)
	{
		var cocktail = this.byName[name]
		if (cocktail)
			cocktail.bake()
		return cocktail
	},
	
	getByNames: function (names)
	{
		var res = []
		
		var byName = this.byName
		for (var i = 0, il = names.length; i < il; i++)
			res[i] = byName[names[i]]
		
		return res
	},
	
	getByToolPrepare: function (name)
	{
		function tools (v)
		{
			var keys = []
			var parts = v.tools
			for (var i = 0, il = parts.length; i < il; i++)
				keys[i] = parts[i][0]
			
			return keys
		}
		this.index.byTool = DB.hashOfAryIndexAryBy(this.db, tools)
	},
	
	getByTool: function (name)
	{
		var res = this.index.byTool[name]
		return res ? res.slice() : []
	},
	
	getByTagPrepare: function ()
	{
		this.index.byTag = DB.hashOfAryIndexByAryKey(this.db, 'tags')
	},
	
	getByTag: function (tag)
	{
		var res = this.index.byTag[tag]
		return res ? this.bakeAry(res.slice()) : []
	},
	
	getByIngredientPrepare: function (name)
	{
		function ingredients (v)
		{
			var keys = []
			var parts = v.ingredients
			for (var i = 0, il = parts.length; i < il; i++)
				keys[i] = parts[i][0]
			
			return keys
		}
		this.index.byIngredient = DB.hashOfAryIndexAryBy(this.db, ingredients)
	},
	
	getByIngredient: function (name)
	{
		var res = this.index.byIngredient[name]
		return res ? res.slice() : []
	},
	
	getByGarnishPrepare: function (name)
	{
		function ingredients (v)
		{
			var keys = []
			var parts = v.garnish
			for (var i = 0, il = parts.length; i < il; i++)
				keys[i] = parts[i][0]
			
			return keys
		}
		this.index.byGarnish = DB.hashOfAryIndexAryBy(this.db, ingredients)
	},
	
	getByGarnish: function (name)
	{
		var res = this.index.byGarnish[name]
		return res ? res.slice() : []
	},
	
	getByGood: function (name)
	{
		return DB.disjunction([this.getByIngredient(name), this.getByGarnish(name), this.getByTool(name)])
	},
	
	getByAnyOfIngredients: function (ingredients)
	{
		var names = []
		for (var i = 0, il = ingredients.length; i < il; i++)
			names.push(ingredients[i].name)
		
		return this.getByAnyOfIngredientsNames(names)
	},
	
	getByAnyOfIngredientsNames: function (names)
	{
		var sets = []
		
		for (var i = 0, il = names.length; i < il; i++)
			sets.push(this.getByIngredient(names[i]))
		
		return DB.disjunction(sets)
	},
	
	getSupplementNamesByIngredientName: function (ingredientName, coefficients)
	{
		var cocktails = this.getByIngredient(ingredientName)
		
		var score = {}
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var parts = cocktails[i].ingredients,
				len = parts.length
			
			if (len == 0)
				continue
			
			var weight = 1 / len
			
			for (var j = 0, jl = len; j < jl; j++)
			{
				var ingredient = parts[j][0]
				
				var subscore = score[ingredient]
				if (!subscore)
					score[ingredient] = weight
				else
					score[ingredient] = subscore + weight
			}
		}
		
		delete score[ingredientName]
		
		for (var k in coefficients)
			if (score[k])
				score[k] *= coefficients[k]
		
		var ingredients = Object.keys(score)
		ingredients.sort(function (a, b) { return score[b] - score[a] })
		return ingredients
	},
	
	guessEntityTypePrepare: function ()
	{
		var index = {}
		
		var list = Ingredient.getTags()
		for (var i = 0, il = list.length; i < il; i++)
			index[list[i]] = 'ingredient-tag'
		
		var gg2type = {ingredients: 'ingredient', tools: 'tool', things: 'thing'}
		var list = Ingredient.getAll()
		for (var i = 0, il = list.length; i < il; i++)
		{
			var ingredient = list[i]
			var gg = Ingredient.getGroupOfGroup(ingredient.group)
			index[ingredient.name] = gg2type[gg]
		}
		
		var list = Cocktail.getAll()
		for (var i = 0, il = list.length; i < il; i++)
		{
			var cocktail = list[i]
			index[cocktail.name] = 'cocktail'
		}
		
		var list = Cocktail.getTags()
		for (var i = 0, il = list.length; i < il; i++)
			index[list[i]] = 'cocktail-tag'
		
		this.index.entityType = index
	},
	
	guessEntityType: function (name)
	{
		return this.index.entityType[name]
	},
	
	getByEntity: function (name)
	{
		var type = this.guessEntityType(name)
		
		switch (type)
		{
			case 'ingredient':
			return this.getByIngredient(name)
			
			case 'ingredient-tag':
			return this.getByAnyOfIngredients(Ingredient.getByTag(name))
			
			case 'cocktail-tag':
			return this.getByTag(name)
			
			case 'cocktail':
			return [this.getByName(name)]
			
			case 'tool':
			case 'thing':
			return this.getByTool(name)
		}
		
		return []
	},
	
	sortIngredientsByUsage: function ()
	{
		// build the index
		this.getByIngredient()
		
		var index = this.index.byIngredient,
			empty = []
		function compare (a, b)
		{
			return (index[b.name] || empty).length - (index[a.name] || empty).length
		}
		
		return compare
	},
	
	sortByComplexity: function (a, b) { return a.ingredients.length - b.ingredients.length },
	
	sortByAddTime: function (a, b) { return b.added - a.added }
}

Object.extend(Me, DB.module.staticMethods)
Object.extend(Me, Me.staticMethods)
Me.findAndBindPrepares()

Me.className = 'Cocktail'
self[Me.className] = Me

Me.initialize
(
	<!--# include virtual="/db/cocktails/cocktails.json" -->,
	<!--# include virtual="/db/cocktails/groups.json" -->,
	<!--# include virtual="/db/cocktails/strengths.json" -->,
	<!--# include virtual="/db/cocktails/methods.json" -->,
	<!--# include virtual="/db/cocktails/tags.json" -->
)

})();

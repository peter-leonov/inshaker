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
	
	getPartsFor: function (count, guests, has)
	{
		var parts = new Me.Parts()
		
		var portions = this.portions || 1
		
		var ingredients = this.ingredients
		for (var i = 0, il = ingredients.length; i < il; i++)
		{
			var v = ingredients[i]
			parts.addGood(Ingredient.getByName(v[0]), v[1] * count)
		}
		
		var garnish = this.garnish
		for (var i = 0, il = garnish.length; i < il; i++)
		{
			var v = garnish[i]
			parts.addGood(Ingredient.getByName(v[0]), v[1] * count)
		}
		
		var tools = this.tools
		for (var i = 0, il = tools.length; i < il; i++)
		{
			var v = tools[i]
			var amount = Me.calculateGoodAmount(v, portions, count, guests, has)
			parts.addGood(Ingredient.getByName(v[0]), amount)
		}
		
		return parts
	},
	
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
		var byName = this.byName
		
		var res = []
		for (var i = 0, il = names.length; i < il; i++)
			res[i] = byName[names[i]]
		
		return res
	},
	
	getAllNames: function (name) { return Object.keys(this.byName) },
	
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
	
	getByTags: function (tags, opts)
	{
		if (!opts)
			opts = {}
		
		var db = opts.db || this.db
		var count = opts.count || tags.length
		
		var hash = DB.hashIndex(tags)
		
		var res = []
		db:
		for (var i = 0, il = db.length; i < il; i++)
		{
			var cocktail = db[i],
				matches = 0
			
			var tags = cocktail.tags
			for (var j = 0, jl = tags.length; j < jl; j++)
				if (hash[tags[j]] && ++matches >= count)
				{
					res.push(cocktail)
					continue db
				}
		}
		return res;
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
		var ingredient = this.getByIngredient(name),
			garnish = this.getByGarnish(name),
			tool = this.getByTool(name)
		
		return DB.disjunction([ingredient, garnish, tool])
	},
	
	getByIngredients: function (ingredients, opts)
	{
		var names = []
		for (var i = 0, il = ingredients.length; i < il; i++)
			names.push(ingredients[i].name)
		
		return this.getByIngredientNames(names, opts)
	},
	
	getByIngredientNames: function (names, opts)
	{
		if (!opts)
			opts = {}
		
		var db = opts.db || this.db
		var count = opts.count || names.length
		var searchGarnish = opts.searchGarnish
		
		// caching names of requested ingredients
		var hash = DB.hashIndex(names)
		
		var res = []
		db:
		for (var i = 0, il = db.length; i < il; i++)
		{
			var cocktail = db[i],
				matches = 0
			
			// always search trough ingredients field
			{
				var set = cocktail.ingredients
				for (var j = 0, jl = set.length; j < jl; j++)
					if (hash[set[j][0]] && ++matches == count) // [0] for ingredient name
					{
						// ta-da we'v found one
						res.push(cocktail)
						continue db
					}
			}
			// here if cocktail does not pass by ingredients
			
			if (searchGarnish)
			{
				var set = cocktail.garnish
				for (var j = 0, jl = set.length; j < jl; j++)
					if (hash[set[j][0]] && ++matches == count) // [0] for ingredient name
					{
						// ta-da we'v found one
						res.push(cocktail)
						continue db
					}
			}
		}
		return res
	},
	
	// IE 6 can perform it 1000 times in 10ms (witout a cache), so stop the paranoia
	getCocktailsByIngredientNameHash: function ()
	{
		if (this._byIngredientName)
			return this._byIngredientName
		
		var cache = this._byIngredientName = {},
			db = this.db
		
		for (var i = 0, il = db.length; i < il; i++)
		{
			var cocktail = db[i],
				ingredients = cocktail.ingredients
			
			for (var j = 0, jl = ingredients.length; j < jl; j++)
			{
				var arr, name = ingredients[j][0]
				
				if ((arr = cache[name]))
					arr.push(cocktail)
				else
					cache[name] = [cocktail]
			}
		}
		
		return cache
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
	
	calculateGoodAmount: function (part, portions, count, guests, has)
	{
		var good = part[0],
			amount = part[1],
			multiplier = part[2]
		
		if (count == 0)
			return 0
		
		
		if (multiplier == 1) // per guest (1)
			return amount * guests
		
		if (!multiplier || multiplier == 2) // helping (undefined, 0 and 2)
			return amount * portions * count
		
		if (multiplier == 3) // per party (3)
		{
			var hasPart = has.getPartByGood(good)
			if (!hasPart)
				return amount
			
			if (hasPart.amount >= amount)
				return 0
			
			return amount - hasPart.amount
		}
		
		// return a save value on an unknown multiplier
		return amount
	},
	
    nameSort: function(a,b) {
        if(a.name > b.name) return 1;
	    else if(a.name == b.name) return 0;
	    else return -1;
    },
	
	complexitySort: function (a, b) { return a.ingredients.length - b.ingredients.length },
	
	addedSort: function (a, b) { return b.added - a.added }
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

<!--# include virtual="CocktailParts.js" -->

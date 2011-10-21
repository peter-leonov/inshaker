Array.prototype.sortedBy = function(sortFunc) {
    return Array.copy(this).sort(sortFunc);
}

Array.prototype.shuffled = function() {
	var array = Array.copy(this);
	var tmp, current, top = array.length;
	
	if(top) while(--top) {
		current = Math.floor(Math.random() * (top + 1));
		tmp = array[current];
		array[current] = array[top];
		array[top] = tmp;
	}
	return array;
}


var Cocktail = function (data)
{
	for (var k in data)
		this[k] = data[k]
}

Cocktail.prototype =
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
		
		var txt = document.createTextNode(this.name)
		a.appendChild(txt)
		
		return li
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

Object.extend(Cocktail,
{
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
			db[i] = byName[name] = new Cocktail(hash[name])
		}
		
		this.db = db
	},
	
	getGroups: function () { return this.groups },
	getStrengths: function () { return this.strengths },
	getMethods: function () { return this.methods },
	getTags: function () { return this.tags.slice() },
	
	getFirstLetters: function (set)
	{
		if (!set)
			set = this.db
		
		var seen = {}
		for (var i = 0, il = set.length; i < il; i++)
			seen[set[i].name.charAt(0).toLowerCase()] = true
		
		var letters = []
		for (var k in seen)
			letters.push(k)
		
		return letters.sort()
	},
	
	getAll: function()
	{
		return this.db
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
	
	getByLetterCache: {},
	getByLetter: function (letter, set)
	{
		letter = letter.toUpperCase()
		var res
		if (res = this.getByLetterCache[letter])
			return res
		res = this.getByLetterCache[letter] = []
		if (!set)
			set = this.db
		
		
		for (var i = 0, il = set.length; i < il; i++)
			if (set[i].name.indexOf(letter) == 0)
			{
				res.push(set[i])
				break
			}
		
		i++
		for (; i < il; i++)
		{
			if (set[i].name.indexOf(letter) == 0)
				res.push(set[i])
			else
				// as cocktails are sorted we can stop searching at the first mismatch
				break
		}
		
		
		// cocktails is already alphabeticaly sorted
		return res
	},
	
	getByGroup: function (group, set) {
		if(!set) set = this.db;
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].groups.indexOf(group) > -1){
				res.push(set[i]);
			}
		}
		return res;
	},
	
	getByTool: function (tool)
	{
		var db = this.db
		
		var res = []
		for (var i = 0, il = db.length; i < il; i++)
		{
			var cocktail = db[i]
			if (cocktail.tools.indexOf(tool) > -1)
				res.push(cocktail)
		}
		return res
	},
	
	getByTags: function (tags, opts)
	{
		if (!opts)
			opts = {}
		
		var db = opts.db || this.db
		var count = opts.count || tags.length
		
		var hash = {}
		for (var i = 0, il = tags.length; i < il; i++)
			hash[tags[i]] = true
		
		var res = [], rest = res.rest = []
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
			
			rest.push(cocktail)
		}
		return res;
	},
	
	getByStrength: function(strength, set) {
		if(!set) set = this.db;
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].strength == strength) {
				res.push(set[i]);
			}
		}
		return res;
	},

    getByMethod: function(method, set) {
        if(!set) set = this.db;
        var res = [];
        for(var i = 0; i < set.length; i++){
             if(set[i].method == method) {
                res.push(set[i]);
             }
        }
        return res;
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
		var hash = {}
		for (var i = 0; i < names.length; i++)
			hash[names[i]] = true
		
		var res = [],
			rest = res.rest = []
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
			// here if cocktail does not pass at all
			
			rest.push(cocktail)
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
		var cocktails = this.getByIngredientNames([ingredientName])
		
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
	
    nameSort: function(a,b) {
        if(a.name > b.name) return 1;
	    else if(a.name == b.name) return 0;
	    else return -1;
    },
	
	complexitySort: function (a, b) { return a.ingredients.length - b.ingredients.length }
})

Cocktail.initialize
(
	<!--# include virtual="/db/cocktails/cocktails.json" -->,
	<!--# include virtual="/db/cocktails/groups.json" -->,
	<!--# include virtual="/db/cocktails/strengths.json" -->,
	<!--# include virtual="/db/cocktails/methods.json" -->,
	<!--# include virtual="/db/cocktails/tags.json" -->
)
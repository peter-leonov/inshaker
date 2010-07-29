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
	loadData: function ()
	{
		var htmlName = this.name_eng.htmlName(),
			path = '/cocktail/' + htmlName
		
		var data = eval('(' + sGet(path + '/data.json').responseText() + ')')
		Object.extend(this, data)
	},
	
	getBigImageSrc: function ()
	{
		var htmlName = this.name_eng.htmlName(),
			path = '/cocktail/' + htmlName
		
		return path + '/' + htmlName + '-big.png'
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
	}
}

Object.extend(Cocktail,
{
    letters: [],
	
	initialize: function (hash, tags, strengths, methods)
	{
		this.tags = tags
		this.strengths = strengths
		this.methods = methods
		
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
	
	getTags: function () { return this.tags },
	getStrengths: function () { return this.strengths },
	getMethods: function () { return this.methods },
	
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
	
	getByName: function (name) { return this.byName[name] },
	
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
	
	getByTag: function (tag, set) {
		if(!set) set = this.db;
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].tags.indexOf(tag) > -1){
				res.push(set[i]);
			}
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
		var db = opts.db || this.db
		var count = opts.count || names.length
		var searchGarnish = opts.searchGarnish
		
		// caching names of requested ingredients
		var hash = {}
		for (var i = 0; i < names.length; i++)
			hash[names[i]] = true
		
		var res = []
		for (var i = 0, il = db.length; i < il; i++)
		{
			var cocktail = db[i],
				matches = 0
			
			// always search trough ingredients field
			{
				var set = cocktail.ingredients
				for (var j = 0, jl = set.length; j < jl; j++)
					if (hash[set[j][0]]) // [0] for ingredient name
						if (++matches == count)
						{
							// ta-da we'v found one
							res.push(cocktail)
							break
						}
			}
			// here if cocktail does not pass by ingredients
			
			if (searchGarnish)
			{
				var set = cocktail.garnish
				for (var j = 0, jl = set.length; j < jl; j++)
					if (hash[set[j][0]]) // [0] for ingredient name
						if (++matches == count)
						{
							// ta-da we'v found one
							res.push(cocktail)
							break
						}
			}
			// here if cocktail does not pass at all
		}
		return res.sort(function (a, b) { return a.ingredients.length - b.ingredients.length })
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
	
    nameSort: function(a,b) {
        if(a.name > b.name) return 1;
	    else if(a.name == b.name) return 0;
	    else return -1;
    }
})

Cocktail.initialize
(
	<!--# include file="/db/cocktails.js" -->,
	<!--# include file="/db/tags.js" -->,
	<!--# include file="/db/strengths.js" -->,
	<!--# include file="/db/methods.js" -->
)
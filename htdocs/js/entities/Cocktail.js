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


Cocktail = function (data)
{
	for (var k in data) this[k] = data[k];
}

Cocktail.prototype =
{
    getMatches: function() {
        return Cocktail.matches[this.name];
    },

    getRound: function() {
        return Cocktail.rounds[this.name];
    },
	
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
	
	getPreviewNode: function ()
	{
		var htmlName = this.name_eng.htmlName(),
			path = '/cocktail/' + htmlName
		
		var li = document.createElement('li')
		li.className = 'cocktail-preview'
		
		var a = document.createElement('a')
		a.className = 'anchor'
		a.href = path + '/'
		li.appendChild(a)
		
		var img = li.img = document.createElement("img")
		img.className = 'image'
		img.src = path + '/' + htmlName + '-small.png'
		a.appendChild(img)
		
		var txt = document.createTextNode(this.name)
		a.appendChild(txt)
		
		return li
	}
}

Object.extend(Cocktail,
{
    letters: [],
    rounds: {},
    matches: {},
	
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
	
    getAll: function(){
        return this.db;
    },

	getByName: function (name) { return this.byName[name] },
	
	getAllNames: function (name) { return Object.keys(this.byName) },
	
	getBySimilarNameCache: {},
	getBySimilarName: function (name)
	{
		if (this.getBySimilarNameCache[name])
			return this.getBySimilarNameCache[name]
			
		var words = name.split(/\s+/),
			res = [], db = this.db
		
		for (var i = 0; i < words.length; i++)
			words[i] = new RegExp("(?:^|\\s)" + words[i], "i")
		
		var first = words[0], jl = words.length
		SEARCH: for (var i = 0; i < db.length; i++)
		{
			var cocktail = db[i], name
			
			if (first.test(cocktail.name))
				name = cocktail.name
			else if (first.test(cocktail.name_eng))
				name = cocktail.name_eng
			else
				continue SEARCH
			
			for (var j = 1; j < jl; j++)
				if (!words[j].test(name))
					continue SEARCH
			
			res.push(cocktail)
		}
		return (this.getBySimilarNameCache[name] = res)
	},
	
	getByHtmlName: function(htmlName){
		for(var i = 0; i < this.db.length; i++){
			if(this.db[i].name_eng.htmlName() == htmlName) return this.db[i];
		}
	},
	
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
    
	getByIngredients: function (ingredients, db)
	{
		this.rounds = {}
		if (!db)
			db = this.db
		
		var ingredientsNames = {}
		for (var i = 0; i < ingredients.length; i++)
			ingredientsNames[ingredients[i].toLowerCase()] = true
		
		var res = []
		for (var i = 0; i < db.length; i++)
		{
			var cocktail = db[i],
				matches = 0
			
			var ci = cocktail.ingredients
			for (var j = 0, jl = ci.length; j < jl; j++)
				if (ingredientsNames[ci[j][0].toLowerCase()])
					matches++
			if (matches > 0)
				res.push(cocktail)
			
			this.rounds[cocktail.name] = jl - matches
            this.matches[cocktail.name] = matches
		}
		return res.sort(this.roundSort).sort(this.lessIngredientsSort).sort(this.matchSort)
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
	
	getByFilters: function(filters, states) {
		var res = [];
		var filtered = false;
		if(filters.name){
			return this.getBySimilarName(filters.name);
		}
		if(filters.letter){
			return this.getByLetter(filters.letter);
		}
		if(filters.tag) {
			res = this.getByTag(filters.tag);
			filtered = true;
		}
		if(filters.strength) {
			var to_filter = [];
			res = this.getByStrength(filters.strength, filtered ? res : null);
			filtered = true;
		}
        if(filters.method) {
            res = this.getByMethod(filters.method, filtered ? res: null);
            filtered = true;
        }
		if(filters.ingredients && filters.ingredients.length) {
            var to_filter = [];
			res = this.getByIngredients(filters.ingredients, filtered ? res : null);
			filtered = true;
		}
        
        if(!filtered) {
            if(filters.state == states.byName) {
                res = this.db.shuffled();
            } else {
                res = this.db.sortedBy(this.nameSort);
		    }
        }
        return res;
	},

    nameSort: function(a,b) {
        if(a.name > b.name) return 1;
	    else if(a.name == b.name) return 0;
	    else return -1;
    },
  
    lessIngredientsSort: function(a,b) {
        var ail = a.ingredients.length, bil = b.ingredients.length;

        if(ail > bil) return 1;
	    else if(ail == bil) return 0;
	    else return -1;
    },

    roundSort: function(a,b) {
        if (a.getRound() > b.getRound()) return 1;
        else if (a.getRound() == b.getRound()) return 0;
        else return -1;
    },

    matchSort: function(a,b) {
        if(a.getMatches() < b.getMatches()) return 1;
        else if(a.getMatches() == b.getMatches()) return 0;
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
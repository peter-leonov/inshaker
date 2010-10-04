;(function(){

eval(NodesShortcut.include())

var Me = self.Ingredient = function (data)
{
	for (var k in data)
		this[k] = data[k]
}

Me.prototype =
{
	constructor: Ingredient,
	
    listOrder: function () { return Ingredient.groups.indexOf(this.group) },
	pageHref: function () { return '/ingredient/' + this.path + '/' },
	getMiniImageSrc: function () { return this.pageHref() + "preview.png" },
	getMainImageSrc: function () { return this.getVolumeImage(this.volumes[0]) },
	cocktailsLink: function () { return '/cocktails.html#state=byIngredients&ingredients=' + encodeURIComponent(this.name) },
	
	getVolumeImage: function (vol)
	{
		var v = vol[0]
		return this.pageHref() + "vol_" + (v === Math.round(v) ? v + '.0' : v + '').replace(".", "_") + ".png"
	},
	
	getPreviewNode: function (lazy)
	{
		var node = Nc('a', lazy ? 'ingredient-preview lazy' : 'ingredient-preview')
		var image = Nc('img', 'image')
		image[lazy ? 'lazySrc' : 'src'] = this.getMiniImageSrc()
		node.appendChild(image)
		
		var name = Nct('span', 'name', this.name)
		node.appendChild(name)
		
		node['data-ingredient'] = this
		node.ingredientImage = image
		
		return node
	}
}

Object.extend(Ingredient,
{
	groups: [],
	
	initialize: function (db, groups, tags)
	{
		var I = Ingredient
		for (var i = 0, il = db.length; i < il; i++)
			db[i] = new I(db[i])
		
		this.db = db
		this.groups = groups
		this.tags = tags
	},
	
	getAll: function ()
	{
		return this.db.slice()
	},
	
	getGroups: function ()
	{
		return this.groups
	},
	
	getTags: function ()
	{
		return this.tags
	},
	
	getByName: function (name)
	{
		if (!this._byName)
			this._updateByNameIndex()
		
		return this._byName[name]
	},
	
	getByNameCI: function (name)
	{
		if (!this._byNameCI)
			this._updateByNameCIIndex()
		
		return this._byNameCI[name.toLowerCase()]
	},
	
	getByTagCI: function (name)
	{
		if (!this._byTagCI)
			this._updateByTagCIIndex()
		
		return this._byTagCI[name.toLowerCase()] || []
	},
	
	getAllNames: function (name)
	{
		if (!this._byName)
			this._updateByNameIndex()
		
		return Object.keys(this._byName)
	},
	
	getAllByNameHash: function ()
	{
		if (!this._byName)
			this._updateByNameIndex()
		
		return this._byName
	},
	
	getByGroup: function(group){
		var res = [];
		for(var i = 0; i < this.db.length; i++){
			if(this.db[i].group == group) res.push(this.db[i]);
		}
		return res;
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
	
	sortByGroups: function(a, b){
		var self = Ingredient;
        if(typeof a == 'object') { a = a[0]; b = b[0] }

		if(self.groups.indexOf(self.getByName(a).group) > 
			self.groups.indexOf(self.getByName(b).group)) return 1;
		else return -1;
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
	
	_updateByNameCIIndex: function ()
	{
		var db = this.db,
			byNameCI = this._byNameCI = {}
		
		for (var i = 0; i < db.length; i++)
		{
			var ingred = db[i]
			byNameCI[ingred.name.toLowerCase()] = ingred
		}
	},
	
	_updateByTagCIIndex: function ()
	{
		var db = this.db,
			index = this._byTagCI = {}
		
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
	
	_updateBySecondNameIndex: function ()
	{
		var db = this.db,
			secondNames = this._secondNames = [],
			nameBySecondName = this._nameBySecondName = {}
		
		for (var i = 0; i < db.length; i++)
		{
			var ingred = db[i],
				snames = ingred.names
			
			if (snames)
			{
				var name = ingred.name
				for (var j = 0; j < snames.length; j++)
				{
					var sn = snames[j]
					nameBySecondName[sn] = name
					secondNames.push(sn)
				}
			}
		}
	},
	
	getNameBySecondNameHash: function ()
	{
		if (!this._nameBySecondName)
			this._updateBySecondNameIndex()
		return this._nameBySecondName
	},
	
	getAllSecondNames: function ()
	{
		if (!this._secondNames)
			this._updateBySecondNameIndex()
		return this._secondNames
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
	
	getByFirstLetter: function (letter)
	{
		var db = this.db, res = []
		letter = letter.toUpperCase()
		
		for (var i = 0, il = db.length; i < il; i++)
		{
			var ingred = db[i]
			if (ingred.name.indexOf(letter) == 0)
				res.push(ingred)
		}
		
		return res
	},
	
	mergeIngredientSets: function ()
	{
		var volumes = {},
			units = {}
		
		for (var i = 0, il = arguments.length; i < il; i++)
		{
			var set = arguments[i]
			
			for (var j = 0, jl = set.length; j < jl; j++)
			{
				var part = set[j],
					name = part[0]
				
				var vol = volumes[name]
				if (vol)
					vol[1] += parseFloat(part[1])
				else
				{
					var am = part[1],
						intam = parseFloat(am)
					
					volumes[name] = [name, intam]
					units[name] = am.substr((intam + '').length + 1)
				}
			}
		}
		
		var res = []
		for (var k in volumes)
		{
			var vol = volumes[k]
			vol[1] = vol[1] + ' ' + units[k]
			res.push(vol)
		}
		
		return res
	},
	
	compareByGroup: function (a, b)
	{
		var groups = Me.groups
		return groups.indexOf(a.group) - groups.indexOf(b.group)
	}
})


Ingredient.initialize(<!--# include file="/db/ingredients.js"-->,<!--# include file="/db/ingredients_groups.js"-->,<!--# include file="/db/ingredients_tags.js"-->)

})();
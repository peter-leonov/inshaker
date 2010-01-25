;(function(){

var Me = self.Ingredient = function (data)
{
	for (var k in data)
		this[k] = data[k]
}

Me.prototype =
{
	constructor: Ingredient,
	volumesRootPath: '/i/merchandise/volumes/',
	
    listOrder: function () { return Ingredient.groups.indexOf(this.group) },
	getMiniImageSrc: function () { return "/i/merchandise/ingredients/" + this.dir + ".png" },
	getMainImageSrc: function () { return this.getVolumeImage(this.volumes[0]) },
	cocktailsLink: function () { return '/cocktails.html#state=byIngredients&ingredients=' + encodeURIComponent(this.name) },
	
	getVolumeImage: function (vol)
	{
		var v = vol[0],
			name = this.brand ? this.brand_dir : this.dir
		
		return this.volumesRootPath + name + "_" + (v === Math.round(v) ? v + '.0' : v + '').replace(".", "_") + "_big.png"
	}
}

Object.extend(Ingredient,
{
	groups: [],
	
	initialize: function (db, groups)
	{
		var I = Ingredient
		for (var i = 0, il = db.length; i < il; i++)
			db[i] = new I(db[i])
		
		this.db = db
		this.groups = groups
	},
	
	getAll: function ()
	{
		return this.db
	},
	
	getGroups: function ()
	{
		return this.groups
	},
	
	getByName: function (name)
	{
		if (!this._byName)
			this._updateByNameIndex()
		
		return this._byName[name]
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
		var res = [], ingreds = this.getByMark(mark)
		for (var i = 0; i < ingreds.length; i++)
			res[i] = ingreds[i].name
		
		return "/cocktails.html#state=byIngredients&ingredients=" + encodeURIComponent(res.join(","))
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
	
	compareByGroup: function (a, b)
	{
		var groups = Me.groups
		return groups.indexOf(a.group) - groups.indexOf(b.group)
	}
})


Ingredient.initialize(<!--# include file="/db/ingredients.js"-->,<!--# include file="/db/ingredients_groups.js"-->)

})();
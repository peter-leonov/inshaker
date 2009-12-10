;(function(){

var Me = self.Ingredient = function (data)
{
	for (var k in data)
		this[k] = data[k]
}

Ingredient.prototype =
{
	constructor: Ingredient,
    getRound: function() { return Ingredient.rounds[this.name] },
    listOrder: function () { return Ingredient.groups.indexOf(this.group) },
	getMiniImageSrc: function () { return "/i/merchandise/ingredients/" + this.dir + ".png" }
}

Object.extend(Ingredient,
{
	groups: [],
    rounds: {},
	
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
	
	getByName: function (name){
		for(var i = 0; i < this.db.length; i++){
			log(this.db[i])
			if(this.db[i].name.toLowerCase() == name.toLowerCase())
                return this.db[i];
		}
	},
	
	getByGroup: function(group){
		var res = [];
		for(var i = 0; i < this.db.length; i++){
			if(this.db[i].group == group) res.push(this.db[i]);
		}
		return res;
	},
	
    getAllRoundsByNames: function(names){
        for(var i = 0; i < this.db.length; i++) 
            this.rounds[this.db[i].name] = Infinity;

        var cocktails = Cocktail.getByIngredients(names);
        var cRounds = Cocktail.rounds;

        for(var i = 0; i < cocktails.length; i++){
            var cName    = cocktails[i].name;
            var cIngreds = cocktails[i].db;
            for(var j = 0; j < cIngreds.length; j++){
                if(this.rounds[cIngreds[j]] > cRounds[cName])
                    this.rounds[cIngreds[j]] = cRounds[cName];
            }
        }
        return this.rounds;
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
			secondNames = this._secondNames = [],
			nameBySecondName = this._nameBySecondName = {},
			byName = this._byName = {}
		
		for (var i = 0; i < db.length; i++)
		{
			var ingred = db[i],
				name = ingred.name,
				snames = ingred.names
			
			byName[name] = ingred
			
			if (snames)
				for (var j = 0; j < snames.length; j++)
				{
					var sn = snames[j]
					nameBySecondName[sn] = name
					secondNames.push(sn)
				}
		}
	},
	
	getNameBySecondNameHash: function ()
	{
		if (!this._nameBySecondName)
			this._updateByNameIndex()
		return this._nameBySecondName
	},
	
	getAllSecondNames: function ()
	{
		if (!this._secondNames)
			this._updateByNameIndex()
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
	
	
	compareByGroup: function (a, b)
	{
		var groups = Me.groups
		return groups.indexOf(a.group) - groups.indexOf(b.group)
	}
})


Ingredient.initialize(<!--# include file="/db/ingredients.js"-->,<!--# include file="/db/ingredients_groups.js"-->)

})();
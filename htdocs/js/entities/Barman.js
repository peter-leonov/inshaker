function Barman (data)
{
	for (var k in data)
		this[k] = data[k]
	
	var cocktails = this.cocktails
	if (!cocktails)
		this.cocktails = []
	else
		for (var i = 0, il = cocktails.length; i < il; i++)
			cocktails[i] = Cocktail.getByName(cocktails[i])
	
	this.constructor = Barman
}

Barman.prototype =
{
	pageHref: function ()
	{
		return '/barman/' + this.path + '/'
	},
	
    next: function () { return Barman.db[Barman.db.indexOf(this) + 1] },
    prev: function () { return Barman.db[Barman.db.indexOf(this) - 1] }
}

Object.extend(Barman,
{
	initialize: function (db)
	{
		for(var i = 0; i < db.length; i++)
			db[i] = new Barman(db[i])
		
		this.db = db
	},
	
	getByName: function (name)
	{
		var db = this.db
		
		for (var i = 0, il = db.length; i < il; i++)
		{
			var barman = db[i]
			if (barman.name == name)
				return barman
		}
		
		return null
	},
	
	byCocktailName: null,
	getByCocktailName: function (name)
	{
		var index = this.byCocktailName
		if (!index)
		{
			index = this.byCocktailName = {}
			
			var db = this.db
			for (var i = 0, il = db.length; i < il; i++)
			{
				var item = db[i],
					cocktails = item.cocktails
				
				for (var j = 0, jl = cocktails.length; j < jl; j++)
					index[cocktails[j].name] = item
			}
		}
		
		return index[name]
	}
})

Barman.initialize(<!--# include file="/db/barmen.js"-->)

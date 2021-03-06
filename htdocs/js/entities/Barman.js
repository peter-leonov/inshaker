function Barman (data)
{
	for (var k in data)
		this[k] = data[k]
	
	var names = this.cocktails
	var cocktails = this.cocktails = []
	
	if (names)
	{
		for (var i = 0, il = names.length; i < il; i++)
		{
			var cocktail = Cocktail.getByName(names[i])
			if (cocktail)
				cocktails.push(cocktail)
		}
	}
	
	this.constructor = Barman
}

Barman.prototype =
{
	pageHref: function ()
	{
		return '/barman/' + this.path + '/'
	},
	
	getPhoto: function ()
	{
		return this.pageHref() + 'photo.jpg'
	}
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
	},
	
	getPrevNext: function (barman)
	{
		var db = this.db,
			l = db.length
		
		var index = db.indexOf(barman)
		var prev = index <= 0 ? db[l - 1] : db[index - 1]
		var next = index >= l - 1 ? db[0] : db[index + 1]
		
		return {previous: prev, next: next}
	},
	
	getAll: function ()
	{
		return this.db.slice()
	}
})

Barman.initialize(<!--# include virtual="/db/barmen/barmen.json"-->)

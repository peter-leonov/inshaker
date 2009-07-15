Bar = function (data)
{
	// Object.extend(this, data)
	for (var k in data)
		this[k] = data[k]
	
	if (!this.feel)
		this.feel = []
	if (!this.format)
		this.format = []
}
Bar.prototype =
{
	constructor: Bar,
	
	smallImageHref: function ()
	{
		return '/i/bar/' + this.city.trans().htmlName() + '/' + this.name_eng.htmlName() + '/mini.jpg'
	},
	
	pageHref: function ()
	{
		return '/bars/' + this.city.trans().htmlName() + '/' + this.name_eng.htmlName() + '.html'
	}
}


Object.extend(Bar,
{
	db: null, // must be defined in db-bars.js by calling initialize()
	
	initialize: function (db)
	{
		// console.time('Bar.initialize')
		var id = 0, byCity = {}
		for (var i = 0; i < db.length; i++)
		{
			var bar = new Bar(db[i]), city = bar.city
			byCity[city] ? byCity[city].push(bar) : byCity[city] = [bar]
			bar.id = ++id
			bar.searchKey = ':' + bar.feel.join(':') + ':\n:' + bar.format.join(':') + ':\n:' + bar.carte.join(':') + ':'
		}
		this.db = byCity
		// console.timeEnd('Bar.initialize')
	},
	
	getByQuery: function (query)
	{
		query = query || {}
		var res = []
		
		var bars = query.city ? this.getAllByCity(query.city) : this.getAll()
		if (!bars)
			return res
		
		var feelRex = query.feel === undefined ? '.*' : '.*:' + query.feel + ':.*'
		var formatRex = query.format === undefined ? '.*' : '.*:' + query.format + ':.*'
		var cocktailRex = query.cocktail === undefined ? '.*' : '.*:' + query.cocktail + ':.*'
		var rex = new RegExp(feelRex + '\n' + formatRex + '\n' + cocktailRex, 'i')
		
		for (var i = 0; i < bars.length; i++)
		{
			var bar = bars[i]
			if (rex.test(bar.searchKey))
				res.push(bar)
		}
		
		return res
	},
	
	getAll: function ()
	{
		var db = this.db
		var bars = []
		for (var k in db)
		{
			var byCity = db[k]
			for (var i = 0; i < byCity.length; i++)
				bars.push(byCity[i])
		}
		return bars
	},
	
	getAllByCity: function (city)
	{
		var bars = this.db[city]
		return bars ? bars.slice() : []
	},
	
	getByCityName: function (city, name)
	{
		var bars = this.getAllByCity(city)
		for (var i = 0; i < bars.length; i++)
			if (bars[i].name == name)
				return bars[i]
		return null
	},
	
	getByCocktailName: function (cocktail)
	{
		return this.getByQuery({cocktail:cocktail})
	},
	
	getPropertiesSorted: function (set, key)
	{
		var hash = {}
		for (var i = 0; i < set.length; i++)
		{
			var bar = set[i]
			var arr = bar[key]
			if (typeof arr != 'object')
				arr = [arr]
			
			for (var j = 0; j < arr.length; j++)
			{
				var val = arr[j]
				if (hash[val])
					hash[val]++
				else
					hash[val] = 1
			}
		}
		
		var res = []
		for (var k in hash)
			res.push(k)
		return res.sort(function (a, b) { return hash[b] - hash[a] })
	},
	
	getCities: function (state) { return this.getPropertiesSorted(this.getByQuery({cocktail:state.cocktail}), 'city') },
	getFormats: function (state) { return this.getPropertiesSorted(this.getByQuery({city:state.city, cocktail:state.cocktail}), 'format') },
	getFeels: function (state) { return this.getPropertiesSorted(this.getByQuery({city:state.city, format:state.format, cocktail:state.cocktail}), 'feel') }
})

Bar.initialize(<!--# include file="/db/bars.js" -->)

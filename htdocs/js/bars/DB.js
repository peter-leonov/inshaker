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
		return '/i/bar/' + this.city.trans().htmlName() + '/' + this.name_eng.htmlName() + '-mini.png'
	},
	
	pageHref: function ()
	{
		return '/bars/' + this.city.trans().htmlName() + '/' + this.name_eng.htmlName() + '.html'
	}
}


DB = {}

DB.Bars =
{
	db: null, // must be defined in db-bars.js by calling initialize()
	
	initialize: function (db)
	{
		// console.time('DB.Bars.initialize')
		var id = 0
		for (var k in db)
		{
			var bars = db[k]
			for (var i = 0; i < bars.length; i++)
			{
				var bar = new Bar(bars[i])
				bars[i] = bar
				bar.city = k
				bar.id = ++id
				bar.searchKey = [':' + bar.feel.join(':') + ':', ':' + bar.format.join(':') + ':', ':' + bar.carte.join(':') + ':'].join('\n')
			}
		}
		this.db = db
		// console.timeEnd('DB.Bars.initialize')
	},
	
	getByQuery: function (query)
	{
		query = query || {}
		var res = []
		
		var bars = query.city ? this.getAllBarsByCity(query.city) : this.getAllBars()
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
		// log(res, query)
		return res
	},
	
	getPrevNext: function (query)
	{
		query = query || {}
		
		var bars = query.city ? this.getAllBarsByCity(query.city) : this.getAllBars()
		if (!bars)
			return []
		
		for (var i = 0; i < bars.length; i++)
			if (bars[i].name == query.name)
				return [bars[i-1], bars[i+1]]
		
		return []
	},
	
	getAllBars: function ()
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
	
	getAllBarsByCity: function (city)
	{
		var bars = this.db[city]
		return bars ? bars.slice() : []
	},
	
	getBarByCityName: function (city, name)
	{
		var bars = this.getAllBarsByCity(city)
		for (var i = 0; i < bars.length; i++)
			if (bars[i].name == name)
				return bars[i]
		return null
	},
	
	getBarByCityId: function (city, id)
	{
		var bars = this.getAllBarsByCity(city)
		for (var i = 0; i < bars.length; i++)
			if (bars[i]["id"] == id)
				return bars[i]
		return null
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
}

DB.Cities =
{
	db: null, // must be defined in db-bars.js by calling initialize()
	
	initialize: function (db)
	{
		this.db = db
	},
	
	getByName: function (name)
	{
		return this.db[name]
	}
}

DB.Cocktails =
{
	db: null, // bust be defined somewhere by calling initialize()
	
	initialize: function (db)
	{
		this.db = db
	},
	
	getByName: function (name)
	{
		return this.db[name]
	}
}

// Bars.Bar = function () {  }
// Bars.Bar.prototype =
// {
// 	
// }
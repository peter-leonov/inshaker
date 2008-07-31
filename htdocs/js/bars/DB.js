var DB = {}

DB.Bars =
{
	db: null, // must be defined in db-bars.js by calling initialize()
	
	initialize: function (db)
	{
		var id = 0
		for (var k in db)
		{
			var bars = db[k]
			for (var i = 0; i < bars.length; i++)
			{
				var bar = bars[i]
				if (!bar.feel)
					bar.feel = []
				if (!bar.format)
					bar.format = []
				if (!bar.id)
					bar.id = ++id
				bar.searchKey = [bar.city, ':' + bar.feel.join(':') + ':', ':' + bar.format.join(':') + ':'].join('\n')
			}
		}
		this.db = db
	},
	
	getByState: function (state)
	{
		state = state || {}
		var res = []
		
		var bars = this.db[state.city]
		if (!bars)
			return res
		
		var feelRex = state.feel === undefined ? '.*' : '.*:' + state.feel + ':.*'
		var formatRex = state.format === undefined ? '.*' : '.*:' + state.format + ':.*'
		var rex = new RegExp(feelRex + '\n' + formatRex, 'i')
		
		for (var i = 0; i < bars.length; i++)
		{
			var bar = bars[i]
			if (rex.test(bar.searchKey))
				res.push(bar)
		}
		res.state = state
		return res
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
			if (bars[i].id == id)
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
	
	getFormatsByCity: function (city) { return this.getPropertiesSorted(this.getByState({city:city}), 'format') },
	getFeelsByCityFormat: function (city, format) { return this.getPropertiesSorted(this.getByState({city:city, format:format}), 'feel') },
	
	
	getCities: function ()
	{
		var db = this.db
		var res = []
		for (var k in db)
			res.push(k)
		return res.sort(function (a, b) { return db[b].length - db[a].length })
	}
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

// Bars.Bar = function () {  }
// Bars.Bar.prototype =
// {
// 	
// }
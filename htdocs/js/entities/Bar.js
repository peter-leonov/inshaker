Bar = function (data)
{
	// Object.extend(this, data)
	for (var k in data)
		this[k] = data[k]
	
	this.openDate = new Date(this.openDate * 1000)
	
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
		return '/bar/' + this.path + '/mini.jpg'
	},
	
	pageHref: function ()
	{
		return '/bar/' + this.path + '/'
	}
}


Object.extend(Bar,
{
	initialize: function (data)
	{
		var byCity = this.byCity = {},
			db = this.db = []
		
		var id = 0
		for (var i = 0; i < data.length; i++)
		{
			var bar = db[i] = new Bar(data[i]), city = bar.city
			byCity[city] ? byCity[city].push(bar) : byCity[city] = [bar]
			bar.id = ++id
			bar.searchKey = ':' + bar.feel.join(':') + ':\n:' + bar.format.join(':') + ':\n:' + bar.carte.join(':') + ':'
		}
		
		byCity['Россия'] = db.slice()
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
		return this.db.slice()
	},
	
	getAllByCity: function (city)
	{
		var bars = this.byCity[city]
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
	
	getCount: function ()
	{
		return this.db.length
	},
	
	getCities: function (state) { return this.getPropertiesSorted(this.getByQuery({cocktail:state.cocktail}), 'city') },
	getFormats: function (state) { return this.getPropertiesSorted(this.getByQuery({city:state.city, cocktail:state.cocktail}), 'format') },
	getFeels: function (state) { return this.getPropertiesSorted(this.getByQuery({city:state.city, format:state.format, cocktail:state.cocktail}), 'feel') }
})

Bar.initialize(<!--# include virtual="/db/bars/bars.json" -->)

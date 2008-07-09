var BarsModel =
{
	initialize: function (db, state)
	{
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
			
				bar.searchKey = [bar.city, ':' + bar.feel.join(':') + ':', ':' + bar.format.join(':') + ':'].join('\n')
			}
		}
		
		this.db = db
		this.setState(state)
	},
	
	setState: function (state)
	{
		var db = this._getBars(state)
		BarsView.modelChanged(db, state)
		BarsView.renderCities(this._getCities(this.db), state.city)
		BarsView.renderFormats(this._getFormatsByCity(state.city), state.format)
		BarsView.renderFeels(this._getFeelsByCityFormat(state.city, state.format), state.feel)
	},
	
	_getBars: function (state)
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
	
	_getCities: function (db)
	{
		var res = []
		for (var k in db)
			res.push(k)
		return res.sort(function (a, b) { return db[b].length - db[a].length })
	},
	
	_getPropertiesSorted: function (bars, key)
	{
		var hash = {}
		for (var i = 0; i < bars.length; i++)
		{
			var bar = bars[i]
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
	
	_getFormatsByCity: function (city) { return this._getPropertiesSorted(this._getBars({city:city}), 'format') },
	_getFeelsByCityFormat: function (city, format) { return this._getPropertiesSorted(this._getBars({city:city, format:format}), 'feel') }
}

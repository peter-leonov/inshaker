var BarsModel =
{
	initialize: function (db)
	{
		this.db = db
		
		for (var i = 0; i < db.length; i++)
		{
			var bar = db[i]
			if (!bar.feel)
				bar.feel = []
			if (!bar.format)
				bar.format = []
			
			bar.searchKey = [bar.city, ':' + bar.feel.join(':') + ':', ':' + bar.format.join(':') + ':'].join('\n')
			// log(bar.searchKey)
		}
		
		BarsView.renderFeels(this._getAllFeels(db))
		BarsView.renderFormats(this._getAllFormats(db))
		BarsView.renderCities(this._getAllCities(db))
		
		BarsView.modelChanged(this._getAllCurrentBars())
	},
	
	anyFormat: 'любой формат',
	anyFeel: 'любая атмосфера',
	
	setCity: function (val)
	{
		this.city = val
		this.format = null
		this.feel = null
		var db = this._getAllCurrentBars()
		BarsView.modelChanged(db)
		BarsView.renderFormats(this._getAllFormats(db))
		BarsView.renderFeels(this._getAllFeels(db))
	},
	setFormat: function (val)
	{
		this.format = val
		this.feel = null
		var db = this._getAllCurrentBars()
		BarsView.modelChanged(db)
		BarsView.renderFeels(this._getAllFeels(db))
	},
	setFeel: function (val)
	{
		this.feel = val
		var db = this._getAllCurrentBars()
		BarsView.modelChanged(db)
	},
	
	_getAllCurrentBars: function ()
	{
		var db = this.db
		var feelRex = (!this.feel || this.feel == this.anyFeel) ? '.*' : '.*:' + this.feel + ':.*'
		var formatRex = (!this.format || this.format == this.anyFormat) ? '.*' : '.*:' + this.format + ':.*'
		var rex = new RegExp(this.city + '\n' + feelRex + '\n' + formatRex, 'i')
		// log(rex)
		
		var res = []
		if (!this.city)
			return res
		for (var i = 0; i < db.length; i++)
		{
			var bar = db[i]
			if (rex.test(bar.searchKey))
				res.push(bar)
		}
		return res
	},
	
	_getPropertiesSorted: function (db, key)
	{
		var hash = {}
		for (var i = 0; i < db.length; i++)
		{
			var bar = db[i]
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
	
	_getAllCities: function (db) { return this._getPropertiesSorted(db, 'city') },
	_getAllFormats: function (db) { var arr = this._getPropertiesSorted(db, 'format'); arr.unshift(this.anyFormat); return arr },
	_getAllFeels: function (db) { var arr = this._getPropertiesSorted(db, 'feel'); arr.unshift(this.anyFeel); return arr }
}

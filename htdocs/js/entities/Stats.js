;(function(){

Me =
{
	initialize: function (db)
	{
		this.index = {}
		this.db = db
	},
	
	getList: function ()
	{
		var periods = Object.keys(this.db)
		periods.sort()
		return periods
	},
	
	getPeriod: function (name)
	{
		return this.db[name]
	},
	
	mergePeriods: function (periods)
	{
		var res = {}
		
		for (var i = 0, il = periods.length; i < il; i++)
			this.addHashes(res, this.getPeriod(periods[i]))
		
		return res
	},
	
	addHashes: function (a, b)
	{
		var c = {}
		
		// just copy
		for (var k in a)
		{
			var src = a[k]
			c[k] = [src[0], src[1]]
		}
		
		for (var k in b)
		{
			var src = b[k]
			
			var dst = c[k]
			if (dst)
			{
				dst[0] += src[0]
				dst[1] += src[1]
			}
			else
				c[k] = [src[0], src[1]]
		}
		
		return c
	}
}

// Me.findAndBindPrepares()

Me.initialize(<!--# include file="/db/stats/all.json" -->)

Me.className = 'Stats'
self[Me.className] = Me

})();

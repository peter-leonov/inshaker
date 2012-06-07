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
			this.addHash(res, this.getPeriod(periods[i]))
		
		return res
	},
	
	addHash: function (a, b)
	{
		for (var k in b)
		{
			var src = b[k]
			
			var dst = a[k]
			if (dst)
			{
				dst[0] += src[0]
				dst[1] += src[1]
			}
			else
				a[k] = [src[0], src[1]]
		}
	}
}

// Me.findAndBindPrepares()

Me.initialize(<!--# include file="/reporter/db/stats/all.json" -->)

Me.className = 'Stats'
self[Me.className] = Me

})();

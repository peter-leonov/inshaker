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
	}
}

// Me.findAndBindPrepares()

Me.initialize(<!--# include file="/db/stats/all.json" -->)

Me.className = 'Stats'
self[Me.className] = Me

})();

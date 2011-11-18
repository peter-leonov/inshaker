;(function(){

Me =
{
	initialize: function (db)
	{
		this.index = {}
		this.db = db
	}
}

// Me.findAndBindPrepares()

Me.initialize(<!--# include file="/db/stats/all.json" -->)

Me.className = 'Stats'
self[Me.className] = Me

})();

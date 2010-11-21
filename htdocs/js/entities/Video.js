;(function(){

var Me =
{
	initialize: function (db)
	{
		this.db = db
	},
	
	getAll: function (name)
	{
		return this.db.slice()
	}
}

Me.initialize(<!--# include file="/db/video.js" -->)

Me.className = 'Video'
self[Me.className] = Me

})();

;(function(){

function Me (data)
{
	this.name = data.name
	this.movie = data.movie
	this.cocktails = data.cocktails
}

Me.prototype =
{
	initialize: function (db)
	{
		for (var i = 0, il = db.length; i < il; i++)
			db[i] = new this(db[i])
		
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

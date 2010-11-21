;(function(){

function Me (data)
{
	this.name = data.name
	this.movie = data.movie
	this.cocktails = data.cocktails
}

Me.prototype =
{
	
}

var myStatic =
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

Object.extend(Me, myStatic)

Me.className = 'Video'
self[Me.className] = Me

Me.initialize(<!--# include file="/db/videos.js" -->)

})();

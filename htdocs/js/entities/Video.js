;(function(){

var C = Cocktail

function Me (data)
{
	this.name = data.name
	this.example = data.example
	this.movie = data.movie
	var cocktails = this.cocktails = data.cocktails
	
	for (var i = 0, il = cocktails.length; i < il; i++)
		cocktails[i] = C.getByName(cocktails[i])
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

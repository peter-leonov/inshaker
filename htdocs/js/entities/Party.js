;(function(){

function Me (data)
{
	this.name = data.name
	this.path = data.path
	this.cocktails = data.cocktails
}

Me.staticMethods =
{
	initialize: function (db)
	{
		for (var i = 0, il = db.length; i < il; i++)
			db[i] = new Me(db[i])
		
		this.db = db
	}
}

Object.extend(Me, Me.staticMethods)

Me.prototype =
{
	
}

Me.initialize(<!--# include file="/db/parties/parties.json" -->)

Me.className = 'Party'
self[Me.className] = Me

})();
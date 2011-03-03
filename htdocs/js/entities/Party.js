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

function bakeFirstRun (me, name)
{
	me[name + 'SecondRun'] = me[name]
	me[name] = function ()
	{
		var firstRun = me[name + 'FirstRun']
		firstRun.apply(me, arguments)
		
		var secondRun = me[name] = me[name + 'SecondRun']
		return secondRun.apply(me, arguments)
	}
}

Me.className = 'Party'
self[Me.className] = Me

})();
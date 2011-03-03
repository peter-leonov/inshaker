;(function(){

function Me (data)
{
	this.data = data
}

Me.staticMethods =
{
	initialize: function (db)
	{
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
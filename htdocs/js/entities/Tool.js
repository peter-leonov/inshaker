;(function(){

function Me (data)
{
	for (var k in data)
		this[k] = data[k]
}

Me.prototype =
{
	imgSrc: function ()
	{
		return '/i/merchandise/tools/' + this.name.trans() + '.png'
	}
}

Me.staticMethods =
{
	db: null,
	
	initialize: function (db)
	{
		this.db = db
		
		for (var i = 0; i < db.length; i++)
		{
			db[i] = new Tool(db[i])
		}
	},
	
	getByName: function (name)
	{
		var db = this.db
		for (var i = 0; i < this.db.length; i++)
		{
			var tool = db[i]
			if (tool.name == name)
				return tool
		}
	}
}

Object.extend(Me, Me.staticMethods)

Me.className = 'Tool'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/tools/tools.json" -->)

})();

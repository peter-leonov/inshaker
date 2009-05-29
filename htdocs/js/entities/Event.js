// TODO: Wrap it in those cute objects like you did with other entities
Event =
{
	db: null, // must be defined in db-events.js by calling initialize()
	
	initialize: function (db)
	{
		this.db = db
		for (var k in db)
		{
			var event = db[k]
			event.date = new Date(event.date)
		}
	},
	
	getByName: function (name)
	{
		return this.db[name]
	},
	
	getNames: function()
	{
		var res = []
		for(var key in this.db) res.push(key)
		return res
	},
	
	getAll: function()
	{
		var res = []
		for(var key in this.db) res.push(this.db[key])
		return res
	},
	
	dateSort: function(a, b)
	{
		return a.date - b.date
	}
}

Event.initialize(<!--# include file="/db/events.js" -->)
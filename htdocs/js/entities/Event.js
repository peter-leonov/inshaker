// TODO: Wrap it in those cute objects like you did with other entities
Event =
{
	db: null, // must be defined in db-events.js by calling initialize()
	
	initialize: function (db)
	{
		this.db = db
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
	
	dateSort: function(a,b)
	{
	    var dateA = new Date(a.date), dateB = new Date(b.date)
	    if(dateA > dateB) return 1
	    else if(dateA == dateB) return 0
	    else return -1
	}
}

Event.initialize(<!--# include file="/db/events.js" -->)
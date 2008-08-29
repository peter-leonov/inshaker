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
	}
}

Event.initialize(<!--# include file="/db/events.js" -->)
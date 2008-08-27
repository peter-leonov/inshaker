Citiy =
{
	db: null, // must be defined in db-bars.js by calling initialize()
	
	initialize: function (db)
	{
		this.db = db
	},
	
	getByName: function (name)
	{
		return this.db[name]
	}
}

Citiy.initialize(<!--# include file="/db/cities.js" -->)
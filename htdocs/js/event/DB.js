if (typeof DB == 'undefined')
	DB = {}

DB.Events =
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

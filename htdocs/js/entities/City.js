City =
{
	initialize: function (db)
	{
		this.db = db
	},
	
	getByName: function (name)
	{
		return this.db[name]
	}
}

City.initialize(<!--# include file="/db/cities.js" -->)
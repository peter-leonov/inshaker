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

City.initialize(<!--# include virtual="/db/bars/cities.json" -->)
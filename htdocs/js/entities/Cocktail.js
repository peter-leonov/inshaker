
Cocktail =
{
	db: null, // bust be defined somewhere by calling initialize()
	
	initialize: function (db)
	{
		this.db = db
	},
	
	getByName: function (name)
	{
		return this.db[name]
	}
}


<!--# include file="/js/common/db.js" -->
Cocktail.initialize(cocktails)
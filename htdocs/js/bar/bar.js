BarPage =
{
	initialize: function (nodes, barsDB, cocktailsDB)
	{
		this.view.owner = this
		this.controller.owner = this
		this.model.owner = this
		
		this.view.initialize(nodes)
		this.model.initialize(barsDB, cocktailsDB)
		
		this.view.readBarCityNames()
	},
	
	mapsApiIsLoaded: function ()
	{
		// this.controller.mapsApiIsLoaded()
		this.view.loadedGMap()
	}
}

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



$.onload
(
	function ()
	{
		Cocktail.initialize(cocktails)
		
		var nodes =
		{
			photos: cssQuery('.b-content .photos')[0],
			recommendations: $('recommendations'),
			carte: $('carte'),
			barName: $('bar-name'),
			cityName: $('city-name'),
			showMore: cssQuery('.about .show-more')[0],
			barMore: cssQuery('.about .more')[0],
			map: $('map'),
			barPrev: cssQuery('.b-title .hrefs .prev')[0],
			barNext: cssQuery('.b-title .hrefs .next')[0]
		}
		BarPage.initialize(nodes, Bar, Cocktail)
	}
)

function googleApiLoaderIsLoaded ()
{
	google.load("maps", "2", {nocss: true, callback: function () { BarPage.mapsApiIsLoaded() }})
}

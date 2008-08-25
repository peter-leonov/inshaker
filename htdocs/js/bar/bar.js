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



$.onload
(
	function ()
	{
		DB.Cocktails.initialize(cocktails)
		
		var nodes =
		{
			photos: cssQuery('.b-content .photos')[0],
			recommendations: $('recommendations'),
			carte: $('carte'),
			barName: $('bar-name'),
			cityName: $('city-name'),
			showMore: cssQuery('.about .show-more')[0],
			barMore: cssQuery('.about .more')[0],
			map: $('map')
		}
		BarPage.initialize(nodes, DB.Bars, DB.Cocktails)

	}
)

function googleApiLoaderIsLoaded ()
{
	google.load("maps", "2", {nocss: true, callback: function () { BarPage.mapsApiIsLoaded() }})
}

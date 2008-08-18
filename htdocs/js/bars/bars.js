BarsPage =
{
	init: function (barsDB, citiesDB, cocktailsDB, nodes)
	{
		var state = {view: 'list'}
		this.controller.initialize(barsDB, cocktailsDB, state)
		this.view.initialize(nodes, citiesDB)
	}
}

function mapsApiIsLoaded ()
{
	BarsPage.view.loadedGMap()
}

$.onload
(
	function ()
	{
		(function () { $.include('/js/compiled/maps.js') }).delay(1500)
		
		DB.Cocktails.initialize(cocktails)
		
		var nodes =
		{
			titleAll: cssQuery('.b-title .all')[0],
			titleSearch: cssQuery('.b-title .search')[0],
			titleSearchName: cssQuery('.b-title .search a')[0],
			titleSearchAll: cssQuery('.b-title .search a')[1],
			viewSwitcher: $('switch-view'),
			barsContainer: $('bars-container'),
			citySelect: $('bars-city'),
			formatSelect: $('bars-format'),
			feelSelect: $('bars-feel'),
			map: $('map')
		}
		
		BarsPage.init(DB.Bars, DB.Cities, DB.Cocktails, nodes)
	}
)
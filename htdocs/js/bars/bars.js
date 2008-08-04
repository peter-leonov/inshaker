BarsPage =
{
	init: function (barsDB, citiesDB, cocktailsDB, nodes)
	{
		var state = {city: 'Москва', view: 'list'}
		this.view.initialize(nodes, citiesDB)
		this.controller.initialize(barsDB, cocktailsDB, state)
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
		
		var viewSwitcher = Switcher.bind($('switch-view'))
		var citySelect = Selecter.bind($('bars-city'))
		var formatSelect = Selecter.bind($('bars-format'))
		var feelSelect = Selecter.bind($('bars-feel'))
		
		var nodes =
		{
			titleAll: cssQuery('.b-title .all')[0],
			titleSearch: cssQuery('.b-title .search')[0],
			titleSearchName: cssQuery('.b-title .search a')[0],
			titleSearchAll: cssQuery('.b-title .search a')[1],
			viewSwitcher: viewSwitcher,
			barsContainer: $('bars-container'),
			citySelect: citySelect,
			formatSelect: formatSelect,
			feelSelect: feelSelect,
			map: $('map')
		}
		
		BarsPage.init(DB.Bars, DB.Cities, DB.Cocktails, nodes)
	}
)
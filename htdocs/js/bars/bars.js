BarsPage =
{
	init: function (barsDB, citiesDB, nodes)
	{
		var state = {city: 'Москва', view: 'list'}
		this.view.initialize(nodes, citiesDB)
		this.controller.initialize(barsDB, state)
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
		
		var viewSwitcher = Switcher.bind($('switch-view'))
		var citySelect = Selecter.bind($('bars-city'))
		var formatSelect = Selecter.bind($('bars-format'))
		var feelSelect = Selecter.bind($('bars-feel'))
		
		var nodes =
		{
			viewSwitcher: viewSwitcher,
			barsContainer: $('bars-container'),
			citySelect: citySelect,
			formatSelect: formatSelect,
			feelSelect: feelSelect,
			map: $('map')
		}
		
		BarsPage.init(DB.Bars, DB.Cities, nodes)
	}
)
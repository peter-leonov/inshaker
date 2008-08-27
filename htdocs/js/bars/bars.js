BarsPage =
{
	init: function (barsDB, citiesDB, cocktailsDB, nodes)
	{
		var state = {view: 'list'}
		this.controller.initialize(barsDB, cocktailsDB, state)
		this.view.initialize(nodes, citiesDB)
	},
	
	mapsApiIsLoaded: function ()
	{
		this.view.loadedGMap()
	}
}

$.onload
(
	function ()
	{
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
		
		BarsPage.init(Bar, Citiy, Cocktail, nodes)
		
	}
)

function googleApiLoaderIsLoaded ()
{
	google.load("maps", "2", {nocss: true, callback: function () { BarsPage.mapsApiIsLoaded() }})
}


<!--# include file="/js/bars/model.js" -->
<!--# include file="/js/bars/controller.js" -->
<!--# include file="/js/bars/view.js" -->

<!--# include file="/lib/Programica/UrlEncode.js" -->
<!--# include file="/lib/Programica/Switcher.js" -->
<!--# include file="/lib/Programica/Select.js" -->




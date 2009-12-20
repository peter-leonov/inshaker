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
		this.view.loadedGMap()
	}
}

$.onready
(
	function ()
	{
		var nodes =
		{
			photos: cssQuery('.b-content .photos')[0],
            priceIndex: $('price-index'),
			carte: $('carte'),
			barName: $('bar-name'),
			cityName: $('city-name'),
			showMore: cssQuery('.about .show-more')[0],
			barMore: cssQuery('.about .more')[0],
            barmanInfoPopup: $('barman-info-popup'),
			barman: cssQuery('.part.barman dd a')[0],
            map: $('map'),
			barPrev: cssQuery('.b-title .hrefs .prev')[0],
			barNext: cssQuery('.b-title .hrefs .next')[0]
		}
		BarPage.initialize(nodes, Bar, Cocktail)
	}
)

function googleApiLoaderIsLoaded ()
{
	google.load("maps", "2", {nocss: true, language: "ru", callback: function () { BarPage.mapsApiIsLoaded() }})
}

<!--# include file="/js/bar/model.js" -->
<!--# include file="/js/bar/controller.js" -->
<!--# include file="/js/bar/view.js" -->

<!--# include file="/js/common/infoPopup.js" -->
<!--# include file="/lib/Programica/WindowName.js" -->
<!--# include file="/lib/Programica/UrlEncode.js" -->

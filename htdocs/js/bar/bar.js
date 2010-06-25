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
	}
}

$.onready
(
	function ()
	{
		var nodes =
		{
			photos: $$('.b-content .photos')[0],
			carte: $('carte'),
			barName: $('bar-name'),
			cityName: $('city-name'),
			showMore: $$('.about .show-more')[0],
			barMore: $$('.about .more')[0],
			map: $('map'),
			positionControl: $$('.position-control')[0],
			barPrev: $$('.b-title .hrefs .prev')[0],
			barNext: $$('.b-title .hrefs .next')[0]
		}
		RoundedCorners.round(nodes.photos)
		BarPage.initialize(nodes, Bar, Cocktail)
	}
)

<!--# include virtual="/lib-0.3/modules/url-encode.js" -->
<!--# include virtual="/lib-0.3/modules/google-api-loader.js" -->

<!--# include virtual="/lib-0.3/widgets/map.js" -->
<!--# include virtual="/lib-0.3/widgets/map-light-marker.js" -->

<!--# include virtual="/js/common/google.js" -->


<!--# include virtual="/js/bars/point.js" -->
<!--# include virtual="model.js" -->
<!--# include virtual="controller.js" -->
<!--# include virtual="view.js" -->

<!--# include virtual="/lib/Programica/WindowName.js" -->

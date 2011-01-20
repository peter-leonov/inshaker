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
			photos:
			{
				root:            $$('.photos')[0],
				viewport:        $$('.photos .viewport')[0],
				surface:         $$('.photos .surface')[0],
				prev:            $$('.photos .prev')[0],
				next:            $$('.photos .next')[0],
				items:           $$('.photos .point')
			},
			carte:
			{
				root:            $$('#carte')[0],
				viewport:        $$('#carte .viewport')[0],
				surface:         $$('#carte .surface')[0],
				prev:            $$('#carte .prev')[0],
				next:            $$('#carte .next')[0]
			},
			barName: $('bar-name'),
			cityName: $('city-name'),
			map: $('map'),
			positionControl: $$('.position-control')[0],
			barPrev: $$('.b-title .hrefs .prev')[0],
			barNext: $$('.b-title .hrefs .next')[0]
		}
		RoundedCorners.round(nodes.photos.root)
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

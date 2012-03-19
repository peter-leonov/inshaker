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
		
		this.view.bindBrandingScroller()
	}
}

$.onready
(
	function ()
	{
		UserAgent.setupDocumentElementClassNames()
		
		var nodes =
		{
			page: $('bar-page'),
			brandedImageHolder: $('branded-image-holder'),
			photos:
			{
				root:            $$('.photos')[0],
				viewport:        $$('.photos .viewport')[0],
				surface:         $$('.photos .surface')[0],
				prev:            $$('.photos .prev')[0],
				next:            $$('.photos .next')[0],
				items:           $$('.photos .point')
			},
			shareBox:
			{
				root: $('share-box'),
				buttons: $$('#share-box .button')
			},
			hitBox: $$('#main-column .info .hit .body')[0],
			barName: $('bar-name'),
			cityName: $('city-name'),
			map: $('map'),
			positionControl: $$('.position-control')[0],
			barPrev: $$('#main-column .common-title .navigation .prev')[0],
			barNext: $$('#main-column .common-title .navigation .next')[0]
		}
		RoundedCorners.round(nodes.photos.root)
		BarPage.initialize(nodes, Bar, Cocktail)
	}
)

<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/liby/modules/interpolate.js" -->
<!--# include virtual="/liby/modules/google-api-loader.js" -->

<!--# include virtual="/liby/widgets/map.js" -->
<!--# include virtual="/liby/widgets/map-light-marker.js" -->

<!--# include virtual="/js/common/google.js" -->
<!--# include virtual="/js/common/branding-scroller.js" -->
<!--# include virtual="/js/common/share-box.js" -->

<!--# include virtual="/js/bars/point.js" -->
<!--# include virtual="model.js" -->
<!--# include virtual="controller.js" -->
<!--# include virtual="view.js" -->

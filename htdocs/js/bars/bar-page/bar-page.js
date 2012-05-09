<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/liby/modules/interpolate.js" -->
<!--# include virtual="/liby/modules/google-api-loader.js" -->

<!--# include virtual="/liby/widgets/map.js" -->
<!--# include virtual="/liby/widgets/map-light-marker.js" -->

<!--# include virtual="/js/common/google.js" -->
<!--# include virtual="/js/common/share-box.js" -->

<!--# include virtual="/js/bars/point.js" -->


;(function(){

var Papa

;(function(){

function Me ()
{
	var m = this.model = new Me.Model(),
		v = this.view = new Me.View(),
		c = this.controller = new Me.Controller()
	
	m.view = v
	v.controller = c
	c.model = m
	
	m.parent = v.parent = c.parent = this
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.view.bind(nodes)
		
		this.view.readBarCityNames()
		
		return this
	}
}

Me.className = 'BarPage'
self[Me.className] = Papa = Me

})();


<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


})();


$.onready
(
	function ()
	{
		UserAgent.setupDocumentElementClassNames()
		
		var nodes =
		{
			page: $('#bar-page'),
			brandedImageHolder: $('#branded-image-holder'),
			photos:
			{
				root:     $('.photos'),
				viewport: $('.photos .viewport'),
				surface:  $('.photos .surface'),
				prev:     $('.photos .prev'),
				next:     $('.photos .next'),
				items:   $$('.photos .point')
			},
			shareBox:
			{
				root: $('#share-box'),
				buttons: $$('#share-box .button')
			},
			hitBox: $('#main-column .info .hit .body'),
			barName: $('#bar-name'),
			cityName: $('#city-name'),
			map: $('#map'),
			positionControl: $('.position-control'),
			barPrev: $('#main-column .common-title .navigation .prev'),
			barNext: $('#main-column .common-title .navigation .next')
		}
		RoundedCorners.round(nodes.photos.root)
		
		var widget = new BarPage()
		widget.bind(nodes)
		
		var nodes =
		{
			page: document.documentElement,
			holder: $('#branded-image-holder')
		}
		
		var bs = new BrandingScroller()
		bs.bind(nodes)
	}
)

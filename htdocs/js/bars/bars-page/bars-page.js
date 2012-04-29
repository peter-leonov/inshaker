<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/liby/modules/google-api-loader.js" -->

<!--# include virtual="/liby/widgets/tab-switcher.js" -->
<!--# include virtual="/liby/widgets/selecter.js" -->
<!--# include virtual="/liby/widgets/map.js" -->
<!--# include virtual="/liby/widgets/map-light-marker.js" -->

<!--# include virtual="/js/common/google.js" -->

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
	c.view = v
	
	m.parent = v.parent = c.parent = this
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.view.bind(nodes)
		
		this.view.checkHash()
	}
}

Me.className = 'BarsPage'
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
		document.documentElement.removeClassName('loading')
		UserAgent.setupDocumentElementClassNames()
		
		var nodes =
		{
			titleAll:
			{
				root: $$('#head .all')[0],
				value: $$('#bars-count .value')[0],
				unit: $$('#bars-count .unit')[0]
			},
			titleSearch: $$('#head .search')[0],
			titleSearchName: $$('#head .search .cocktail')[0],
			titleSearchAll: $$('#head .search .drop-cocktail')[0],
			viewSwitcher: $('switch-view'),
			viewSwitcherButtons: $$('#switch-view .view-list, #switch-view .view-map'),
			barsContainer: $('bars-container'),
			citySelecter:
			{
				main: $('bars-city'),
				button: $$('#bars-city .button')[0],
				options: $$('#bars-city .options')[0]
			},
			formatSelecter:
			{
				main: $('bars-format'),
				button: $$('#bars-format .button')[0],
				options: $$('#bars-format .options')[0]
			},
			feelSelecter:
			{
				main: $('bars-feel'),
				button: $$('#bars-feel .button')[0],
				options: $$('#bars-feel .options')[0]
			},
			map: $('map'),
			mapSurface: $$('#map .surface')[0],
			positionControl: $$('.position-control')[0]
		}
		
		RoundedCorners.round(nodes.map)
		
		var widget = new BarsPage()
		widget.bind(nodes)
	}
)

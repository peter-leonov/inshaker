<!--# include virtual="/liby/core/fixes/onhashchange.js"-->

<!--# include virtual="/liby/modules/location-hash.js" -->
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
		
		return this
	},
	
	checkState: function ()
	{
		this.view.locationHashUpdated()
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
				root: $('#head .all'),
				value: $('#bars-count .value'),
				unit: $('#bars-count .unit')
			},
			titleSearch: $('#head .search'),
			titleSearchName: $('#head .search .cocktail'),
			titleSearchAll: $('#head .search .drop-cocktail'),
			viewSwitcher: $('#switch-view'),
			viewSwitcherButtons: $$('#switch-view .view-list, #switch-view .view-map'),
			barsContainer: $('#bars-container'),
			citySelecter:
			{
				main: $('#bars-city'),
				button: $('#bars-city .button'),
				options: $('#bars-city .options')
			},
			formatSelecter:
			{
				main: $('#bars-format'),
				button: $('#bars-format .button'),
				options: $('#bars-format .options')
			},
			feelSelecter:
			{
				main: $('#bars-feel'),
				button: $('#bars-feel .button'),
				options: $('#bars-feel .options')
			},
			map: $('#map'),
			mapSurface: $('#map .surface'),
			positionControl: $('.position-control')
		}
		
		RoundedCorners.round(nodes.map)
		
		var widget = new BarsPage()
		widget.bind(nodes).checkState()
	}
)

BarsPage =
{
	initialize: function (nodes)
	{
		var state = {view: 'list'}
		var model = this.model = new BarsPageModel()
		var controller = this.controller = new BarsPageController(state)
		var view = this.view = new BarsPageView(controller, nodes)
		model.view = view
		controller.view = view
		controller.model = model
		
		view.checkHash()
	}
}

$.onready
(
	function ()
	{
		document.documentElement.removeClassName('loading')
		UserAgent.setupDocumentElementClassNames()
		
		WindowName.init()
		
		var nodes =
		{
			titleAll: $$('#head .all')[0],
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
		
		BarsPage.initialize(nodes)
	}
)

<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/liby/modules/window-name.js" -->
<!--# include virtual="/liby/modules/google-api-loader.js" -->

<!--# include virtual="/liby/widgets/tab-switcher.js" -->
<!--# include virtual="/liby/widgets/selecter.js" -->
<!--# include virtual="/liby/widgets/map.js" -->
<!--# include virtual="/liby/widgets/map-light-marker.js" -->

<!--# include virtual="/js/common/google.js" -->

<!--# include virtual="point.js" -->
<!--# include virtual="model.js" -->
<!--# include virtual="controller.js" -->
<!--# include virtual="view.js" -->

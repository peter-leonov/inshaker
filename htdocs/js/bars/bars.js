// fix for FF 1.5 ;)
if (!Array.copy)
	Array.copy = function (src) { return Array.prototype.slice.call(src) }

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
		document.documentElement.removeClassName('loading')
		
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
			
			moreInfo: $('more-info'),
			guidePopup: $('guide-info-popup'),
			guidePopupBody: $$('#guide-info-popup .popup-window')[0]
		}
		
		RoundedCorners.round(nodes.map)
		
		BarsPage.initialize(nodes)
	}
)

function googleApiLoaderIsLoaded ()
{
	google.load('maps', '2', {nocss: true, language: 'ru', callback: function () { BarsPage.mapsApiIsLoaded() }})
}

Element.prototype.hide = function () { this.addClassName('hidden') }
Element.prototype.show = function () { this.removeClassName('hidden') }

<!--# include virtual="/lib-0.3/modules/url-encode.js" -->

<!--# include virtual="/lib-0.3/widgets/tab-switcher.js" -->
<!--# include virtual="/lib-0.3/widgets/selecter.js" -->

<!--# include virtual="/js/bars/model.js" -->
<!--# include virtual="/js/bars/controller.js" -->
<!--# include virtual="/js/bars/view.js" -->


<!--# include virtual="/lib/Programica/LocationHash.js" -->
<!--# include virtual="/lib/Programica/WindowName.js" -->

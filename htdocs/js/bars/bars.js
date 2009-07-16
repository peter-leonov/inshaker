window.menuItem = "bars.html"

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

$.onload
(
	function ()
	{
		var nodes =
		{
			titleAll: cssQuery('#head .all')[0],
			titleSearch: cssQuery('#head .search')[0],
			titleSearchName: cssQuery('#head .search .cocktail')[0],
			titleSearchAll: cssQuery('#head .search .drop-cocktail')[0],
			viewSwitcher: $('switch-view'),
			viewSwitcherButtons: cssQuery('#switch-view .view-list, #switch-view .view-map'),
			barsContainer: $('bars-container'),
			formatSelect: $('bars-format'),
			feelSelect: $('bars-feel'),
			map: $('map'),
			
			moreInfo: $('more-info'),
			guidePopup: $('guide-info-popup'),
			guidePopupBody: cssQuery('#guide-info-popup .info-popup')[0]
		}
		
		BarsPage.initialize(nodes)
	}
)

function googleApiLoaderIsLoaded ()
{
	google.load('maps', '2', {nocss: true, language: 'ru', callback: function () { BarsPage.mapsApiIsLoaded() }})
}

Element.prototype.hide = function () { this.addClassName('hidden') }
Element.prototype.show = function () { this.remClassName('hidden') }


<!--# include file="/js/bars/model.js" -->
<!--# include file="/js/bars/controller.js" -->
<!--# include file="/js/bars/view.js" -->

<!--# include file="/lib/Programica/UrlEncode.js" -->
<!--# include file="/lib/Programica/LocationHash.js" -->
<!--# include file="/lib/Programica/WindowName.js" -->
<!--# include file="/lib/Widgets/Switcher.js" -->
<!--# include file="/lib/Widgets/Selecter.js" -->

<!--# include file="/lib/Programica/Request.js" -->
<!--# include file="/lib/Programica/Form.js" -->

<!--# include file="/lib/Programica/Widget.js" -->
<!--# include file="/lib/Widgets/FormPoster.js" -->


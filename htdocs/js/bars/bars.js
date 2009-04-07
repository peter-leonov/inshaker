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
			titleAll: cssQuery('.b-title .all')[0],
			titleSearch: cssQuery('.b-title .search')[0],
			titleSearchName: cssQuery('.b-title .search a')[0],
			titleSearchAll: cssQuery('.b-title .search a')[1],
			viewSwitcher: $('switch-view'),
			viewSwitcherButtons: cssQuery('#switch-view a'),
			barsContainer: $('bars-container'),
			formatSelect: $('bars-format'),
			feelSelect: $('bars-feel'),
			map: $('map'),
			
			dontMiss: $('dont-miss'),
            photographer: $('photographer'),
			photoPopup: $('guide-info-popup')
		}
		
		BarsPage.initialize(nodes)
	}
)

function googleApiLoaderIsLoaded ()
{
	google.load("maps", "2", {nocss: true, callback: function () { BarsPage.mapsApiIsLoaded() }})
}


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

<!--# include file="/js/common/autocompleter.js" -->
<!--# include file="/js/common/newsFormPopup.js" -->
<!--# include file="/js/common/infoPopup.js" -->



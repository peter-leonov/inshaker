MagazinePage =
{
	initialize: function (nodes)
	{
		var params = <!--# include file="/db/magazine.js"-->
		var model       = this.model         = new MagazinePageModel(params)
		var controller  = this.controller    = new MagazinePageController()
		var view        = this.view          = new MagazinePageView(nodes)
		
		model.view = view
		controller.view = view
		controller.model = model
		view.controller = controller
		
		view.start()
	}
}

$.onready
(
	function ()
	{
		var nodes =
		{
			cocktails: cssQuery('.info-blocks .cocktail-list'),
			promo: $('promo'),
			arrows:[cssQuery('#promo-prev')[0], cssQuery('#promo-next')[0]]
		}
		
		MagazinePage.initialize(nodes)
	}
)

<!--# include virtual="/js/common/url-encode.js" -->
<!--# include virtual="model.js" -->
<!--# include virtual="controller.js" -->
<!--# include virtual="view.js" -->

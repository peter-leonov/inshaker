MagazinePage =
{
	initialize: function (nodes)
	{
		var params = <!--# include virtual="/db/magazine/magazine.json"-->
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
			cocktails: $$('.info-blocks .cocktail-list'),
			promo: $('promo'),
			arrows:[$$('#promo-prev')[0], $$('#promo-next')[0]]
		}
		
		MagazinePage.initialize(nodes)
	}
)

<!--# include virtual="/lib-0.3/modules/url-encode.js" -->
<!--# include virtual="/lib-0.3/modules/array-randomize.js" -->

<!--# include virtual="/lib-0.3/modules/global-timer.js" -->
<!--# include virtual="/lib-0.3/modules/motion.js" -->
<!--# include virtual="/lib-0.3/modules/motion-types.js" -->
<!--# include virtual="/lib-0.3/modules/animation.js" -->
<!--# include virtual="/js/common/rolling-images.js" -->

<!--# include virtual="model.js" -->
<!--# include virtual="controller.js" -->
<!--# include virtual="view.js" -->

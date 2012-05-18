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
		UserAgent.setupDocumentElementClassNames()
		
		var nodes =
		{
			cocktails: $$('.info-blocks .cocktail-list'),
			tagsList: $('#tags-list'),
			promo: $('#promo'),
			arrows: [$('#promo-prev'), $('#promo-next')]
		}
		
		MagazinePage.initialize(nodes)
	}
)

<!--# include virtual="/liby/modules/motion.js" -->
<!--# include virtual="/liby/modules/motion-types.js" -->
<!--# include virtual="/liby/modules/animation.js" -->
<!--# include virtual="/js/common/rolling-images.js" -->

<!--# include virtual="model.js" -->
<!--# include virtual="controller.js" -->
<!--# include virtual="view.js" -->

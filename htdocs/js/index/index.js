IndexPage =
{
	initialize: function (nodes)
	{
        var params = <!--# include file="/db/magazine.js"-->
        var model       = this.model         = new IndexPageModel(params)
		var controller  = this.controller    = new IndexPageController()
		var view        = this.view          = new IndexPageView(nodes)
		
		model.view = view
		controller.view = view
		controller.model = model
		view.controller = controller
		
		view.start()
	}
}

$.onload
(
	function ()
	{
		var nodes =
		{
			cocktails: cssQuery('.info-blocks .cocktails-list')[0],
			links: cssQuery('.info-blocks .links-list')[0],
            promo: $('promo'),
			dontMiss: $('dont-miss'),
            arrows:[cssQuery('#promo-prev')[0], cssQuery('#promo-next')[0]]
		}

    IndexPage.initialize(nodes)
	}
)

<!--# include file="/lib/Programica/Request.js" -->
<!--# include file="/lib/Programica/Form.js" -->

<!--# include file="/lib/Programica/Widget.js" -->
<!--# include file="/lib/Widgets/FormPoster.js" -->

<!--# include file="/js/common/autocompleter.js" -->
<!--# include file="/js/common/newsFormPopup.js" -->

<!--# include file="/js/index/model.js" -->
<!--# include file="/js/index/controller.js" -->
<!--# include file="/js/index/view.js" -->


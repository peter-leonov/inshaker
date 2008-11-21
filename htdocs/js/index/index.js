IndexPage =
{
	initialize: function (nodes)
	{
		var model       = this.model         = new IndexPageModel()
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
			cocktails: cssQuery('.info-blocks .cocktails-list')[0]
		}
		
		IndexPage.initialize(nodes)
	}
)

<!--# include file="/js/index/model.js" -->
<!--# include file="/js/index/controller.js" -->
<!--# include file="/js/index/view.js" -->


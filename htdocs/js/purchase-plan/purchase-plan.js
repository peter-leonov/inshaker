;(function(){

var myName = 'PurchasePlan',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind : function (nodes)
	{
		this.view.bind(nodes)
		this.model.bind()
		this.controller.bind()
	},
	
	setMainState : function()
	{
		this.model.setMainState()
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();

<!--# include virtual="/liby/core/fixes/keydown-to-keypress.js"-->

<!--# include virtual="/liby/modules/user-agent.js" -->

<!--# include virtual="/liby/modules/child-indexed-path.js"-->
<!--# include virtual="/liby/modules/cloner.js"-->

<!--# include virtual="/js/common/popup.js" -->
<!--# include virtual="/js/common/ingredient-popup.js" -->

<!--# include virtual="/js/common/purchase-plan-table-editable.js" -->

<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->

;(function(){

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	document.documentElement.removeClassName('loading')
	
	IngredientPopup.bootstrap()
	
	var nodes = {
		barName : $$('#common-main-wrapper .purchase-plan-box .section-head .bar-name')[0],
		totalPrice : $$('#common-main-wrapper .purchase-plan-box .total-price-wrapper .total-price')[0],
		wrapper : $$('#common-main-wrapper .purchase-plan-box .purchase-table-wrapper')[0]
	}
	
	var widget = new PurchasePlan()
	widget.bind(nodes)
}

$.onready(onready)

})();

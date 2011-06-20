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

<!--# include virtual="/lib-0.3/modules/user-agent.js" -->
<!--# include virtual="/js/common/purchase-plan-table.js" -->

<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->

;(function(){

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	document.documentElement.removeClassName('loading')
	
	var nodes = {
		barName : $$('#common-main-wrapper .header .bar-name')[0],
		totalPrice : $$('#common-main-wrapper .purchase-plan-box .total-price-wrapper .total-price')[0],
		wrapper : $$('#common-main-wrapper .purchase-plan-box .purchase-table-wrapper')[0]
	}
	
	var widget = new PurchasePlan()
	widget.bind(nodes)	
	setTimeout('window.print()', 100)
}

$.onready(onready)

})();

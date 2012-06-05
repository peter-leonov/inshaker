;(function(){

var myName = 'Foreign',
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
	}
}

Object.extend(Me.prototype, myProto)

})();

<!--# include virtual="/liby/modules/user-agent.js" -->

<!--# include virtual="/js/common/ingredient-popup.js" -->

<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


;(function(){

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	document.documentElement.removeClassName('loading')
	
	IngredientPopup.bootstrap()
	
	Ingredient.calculateEachIngredientUsage()
	
	var nodes = 
	{
		title : $('head title'),
		
		mainBox : $('#common-main-wrapper .main-box'),
		
		ingredients : {
			box : $('#common-main-wrapper .ingredients-box'),
			barName : $('#common-main-wrapper .ingredients-box .section-head h2 .bar-name'),
			list : $('#common-main-wrapper .ingredients-box .ingredients-list'),
			empty : $('#common-main-wrapper .ingredients-box .empty-notice')
		},
		
		cocktails : {
			box : $('#common-main-wrapper .cocktails-box'),
			title : {
				h2 : $('#common-main-wrapper .cocktails-box .section-head h2'),
				plural : $('#common-main-wrapper .cocktails-box .section-head h2 .plural')
			},
			list : $('#common-main-wrapper .cocktails-box .cocktails-wrapper .cocktails-list'),
			empty : $('#common-main-wrapper .cocktails-box .empty-notice')
		},
		
		failBox : $('#common-main-wrapper .fail-box'),
		mybarLinkBox : $('#common-main-wrapper .mybar-link-box')
	}
	
	var widget = new Foreign()
	widget.bind(nodes)
}

$.onready(onready)

})();
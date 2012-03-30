;(function(){

var myName = 'CocktailCart',
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

<!--# include virtual="/liby/modules/user-agent.js" -->
	
<!--# include virtual="/js/common/units.js" -->

<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


;(function(){

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	document.documentElement.removeClassName('loading')
	var nodes = 
	{
		barName : $$('#common-main-wrapper .header .bar-name')[0],
		pageWrapper : $$('#common-main-wrapper .page-wrapper')[0],
		cartBox :  $$('#common-main-wrapper .cocktail-cart-box')[0],
		alcoholBox :  $$('#common-main-wrapper .cocktail-cart-box .alcohol-box')[0],
		alcoholList : $$('#common-main-wrapper .cocktail-cart-box .alcohol-box .cocktail-list')[0],
		nonAlcoholBox :  $$('#common-main-wrapper .cocktail-cart-box .non-alcohol-box')[0],
		nonAlcoholList : $$('#common-main-wrapper .cocktail-cart-box .non-alcohol-box .cocktail-list')[0],
		main : $$('#common-main-wrapper')[0]
	}
	
	var widget = new CocktailCart()
	widget.bind(nodes)
	setTimeout(function () { window.print() }, 1000)
}

$.onready(onready)

})();
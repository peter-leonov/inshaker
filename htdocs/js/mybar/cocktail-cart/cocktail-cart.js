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
	document.documentElement.classList.remove('loading')
	var nodes = 
	{
		barName : $('#common-main-wrapper .header .bar-name'),
		pageWrapper : $('#common-main-wrapper .page-wrapper'),
		cartBox :  $('#common-main-wrapper .cocktail-cart-box'),
		alcoholBox :  $('#common-main-wrapper .cocktail-cart-box .alcohol-box'),
		alcoholList : $('#common-main-wrapper .cocktail-cart-box .alcohol-box .cocktail-list'),
		nonAlcoholBox :  $('#common-main-wrapper .cocktail-cart-box .non-alcohol-box'),
		nonAlcoholList : $('#common-main-wrapper .cocktail-cart-box .non-alcohol-box .cocktail-list'),
		main : $('#common-main-wrapper')
	}
	
	var widget = new CocktailCart()
	widget.bind(nodes)
	window.setTimeout(function () { window.print() }, 1000)
}

$.onready(onready)

})();
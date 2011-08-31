/**
 * dependencies:
 *    Barman.js
 *    Cocktail.js
 */
;(function(){

var myName = 'BarmanPage'
var Me = self[myName] = MVC.create(myName)

var myProto =
{
	initialize: function ()
	{
		this.model.initialize()
		this.view.initialize()
		this.controller.initialize()
	},
	
	bind: function (nodes, sources, state)
	{
		this.model.bind(sources)
		this.view.bind(nodes)
		this.controller.bind(state)
		
		this.view.findBarmanName()
		
		return this
	},
	
	setCocktails: function ()
	{
		this.controller.setCocktails()
	},
	
	setNextAndPrevBarmen: function ()
	{
		this.controller.setNextAndPrevBarmen()
	}
}

Object.extend(Me.prototype, myProto)

})();

$.onready(function ()
{
	document.documentElement.removeClassName('loading')
	
	var nodes =
	{
		barmanName: $$('#head .name')[0],
		cocktailList: $$('.common-content .cocktails')[0],
		prevBarman: $$('#head .arrow.prev')[0],
		nextBarman: $$('#head .arrow.next')[0]
	}
	
	var sources =
	{
		barman: Barman
	}
	
	var page = new BarmanPage()
	
	page.bind(nodes, sources)
})


<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->

/**
 * dependencies:
 *    Barman.js
 *    Cocktail.js
 */
;(function(){

var myName = 'BarmensPage'
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
		
		return this
	},
	
	setCocktails: function ()
	{
		this.controller.setCocktails()
	},
	
	setNextAndPrevBarmens: function ()
	{
		this.controller.setNextAndPrevBarmens()
	}
}

Object.extend(Me.prototype, myProto)

})();

$.onready(function ()
{
	var nodes =
	{
		barmanName: $$('.b-title .name')[0],
		cocktailList: $$('.b-content .cocktails')[0],
		prevBarman: $$('.b-title .arrow.prev')[0],
		nextBarman: $$('.b-title .arrow.next')[0]
	}
	var sources =
	{
		barman: Barman.getByName(nodes.barmanNameNode.getAttribute('data-barman-name'))
	}
	
	var page = new BarmensPage()
	
	page.bind(nodes, sources)
	page.setCocktails()
	page.setNextAndPrevBarmens()
})


<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->

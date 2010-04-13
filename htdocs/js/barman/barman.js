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
		ajaxLoadingImage: $$('.loading')[0],
		barmanNameNode: $$('h1[data-barman-name]')[0],
		barmanCocktailsList: $$('ul.point')[0],
		nextBarman: $$('a.arrow.next')[0],
		prevBarman: $$('a.arrow.prev')[0]
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

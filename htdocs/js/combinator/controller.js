;(function(){

var Papa = CombinatorPage, Me = Papa.Controller

var myProto =
{
	initialize: function ()
	{
		this.state = {}
	},
	
	bind: function () {},
	
	setState: function (state)
	{
		this.model.setState(state)
	},
	
	setQuery: function (add, remove, query)
	{
		this.model.setQuery(add, remove, query)
	},
	
	queryChanged: function (add, remove)
	{
		this.model.queryChanged(add, remove)
	},
	
	setSortBy: function (type)
	{
		this.model.setSortBy(type)
	},
	
	updateInitialBlock: function ()
	{
		this.model.updateAllIngredients()
		this.model.updateExamples()
	},
	
	ingredientSelected: function (ingredient)
	{
		this.model.selectIngredient(ingredient)
	},
	
	windowScrolled: function (v)
	{
		this.model.setScrollTop(v)
	}
}

Object.extend(Me.prototype, myProto)

})();

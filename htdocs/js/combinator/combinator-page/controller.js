;(function(){

function Me ()
{
	this.state = {}
}

Me.prototype =
{
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
		this.model.updateExample()
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

Papa.Controller = Me

})();

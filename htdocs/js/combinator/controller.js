;(function(){

var Papa = CombinatorPage, Me = Papa.Controller

var myProto =
{
	initialize: function ()
	{
		this.state = {}
	},
	
	bind: function () {},
	
	setQuery: function (add, remove)
	{
		this.model.setQuery(add, remove)
	},
	
	quickQueryChange: function (add, remove)
	{
		this.model.quickQueryChange(add, remove)
	},
	
	setSortBy: function (type)
	{
		this.model.setSortBy(type)
	},
	
	updateInitialBlock: function ()
	{
		this.model.updateAllIngredients()
	}
}

Object.extend(Me.prototype, myProto)

})();

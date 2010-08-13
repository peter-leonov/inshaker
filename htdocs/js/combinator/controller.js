;(function(){

var Papa = CombinatorPage, Me = Papa.Controller

var myProto =
{
	initialize: function ()
	{
		this.state = {}
	},
	
	bind: function () {},
	
	setIngredientsNames: function (add, remove)
	{
		this.model.setIngredientsNames(add, remove)
	},
	
	setWithouts: function (add, remove)
	{
		this.model.setWithouts(add, remove)
	},
	
	setSortBy: function (type)
	{
		this.model.setSortBy(type)
	}
}

Object.extend(Me.prototype, myProto)

})();

;(function(){

var Papa = IngredientsPage, Me = Papa.Controller

var myProto =
{
	initialize: function ()
	{
		this.state = {}
	},
	
	bind: function (state)
	{
		this.model.setState(state)
	},
	
	groupBySelected: function (type)
	{
		this.model.setGroupBy(type)
	},
	
	sortBySelected: function (type)
	{
		this.model.setSortBy(type)
	},
	
	drawBySelected: function (type)
	{
		this.model.setDrawBy(type)
	}
}

Object.extend(Me.prototype, myProto)

})();

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
	
	setDuplicates: function (add, remove)
	{
		this.model.setDuplicates(add, remove)
	},
	
	setSortBy: function (type)
	{
		this.model.setSortBy(type)
	}
}

Object.extend(Me.prototype, myProto)

})();

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
	}
}

Object.extend(Me.prototype, myProto)

})();

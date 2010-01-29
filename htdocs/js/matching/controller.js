;(function(){

var Papa = MatchingPage, Me = Papa.Controller

var myProto =
{
	initialize: function ()
	{
		this.state = {}
	},
	
	toggleIngredient: function (ingredient)
	{
		this.model.toggleIngredient(ingredient)
	}
}

Object.extend(Me.prototype, myProto)

})();
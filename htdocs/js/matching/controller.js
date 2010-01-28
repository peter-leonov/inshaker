;(function(){

var Papa = MatchingPage, Me = Papa.Controller

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
	
	toggleIngredient: function (ingredient)
	{
		this.model.toggleIngredient(ingredient)
	}
}

Object.extend(Me.prototype, myProto)

})();
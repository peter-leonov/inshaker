;(function(){

var Papa = MatchingPage, Me = Papa.Controller

var myProto =
{
	initialize: function ()
	{
		this.state = {}
	},
	
	toggleIngredients: function (ingredients)
	{
		this.model.toggleIngredients(ingredients)
	}
}

Object.extend(Me.prototype, myProto)

})();
;(function(){

var Papa = CombinatorPage, Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.sources = {}
		this.state = {}
	},
	
	bind: function (ds)
	{
		this.ds = ds
	},
	
	setState: function (state)
	{
		this.state = state
		
		this.view.renderCocktails(this.ds.cocktail.getByStrength('безалкогольные'))
	}
}

Object.extend(Me.prototype, myProto)

})();
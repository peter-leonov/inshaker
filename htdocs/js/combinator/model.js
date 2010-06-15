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
		
		var cocktails = this.ds.cocktail.getByIngredientNames(['Малина'])
		cocktails.sort(function (a, b) { return a.ingredients.length - b.ingredients.length })
		this.view.renderCocktails(cocktails)
	}
}

Object.extend(Me.prototype, myProto)

})();
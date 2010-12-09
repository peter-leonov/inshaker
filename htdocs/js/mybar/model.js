;(function(){

var Papa = MyBar, Me = Papa.Model

var myProto =
{
	bind : function ()
	{
		this.cocktails = Cocktail.getAll().slice(50,55)
		this.ingredients = this.fetchIngredints(this.cocktails)
		this.view.renderCocktails(this.cocktails)
		this.view.renderIngredients(this.ingredients)
	},
	
	fetchIngredints : function(cocktails)
	{
		var ingr = {}
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktailIngr = cocktails[i].ingredients.slice().map(function(a){ return a[0] })
			for( var j = 0; j < cocktailIngr.length; j++ )
				ingr[cocktailIngr[j]] = true
		}
		
		var ingredients = []
		for( i in ingr )
			ingredients.push(Ingredient.getByName(i))
			
		return ingredients.sort(function(a,b){ return a.name > b.name ? 1 : -1 })
		
	}
}

Object.extend(Me.prototype, myProto)

})();
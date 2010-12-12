;(function(){

var Papa = MyBar, Me = Papa.Controller

var myProto =
{
	bind : function()
	{
		
	},
	
	cocktailQuerySubmit : function(query)
	{
		this.model.handleCocktailQuery(query)
	},
	
	ingrQuerySubmit : function(query)
	{
		this.model.handleIngrQuery(query)
	},
	
	addIngredientToBar : function(ingredientName)
	{
		this.model.addIngredientToBar(ingredientName)
	},
	
	removeIngredientFromBar : function(ingredientName)
	{
		this.model.removeIngredientFromBar(ingredientName)
	},
	
	removeCocktailFromBar : function(cocktailName)
	{
		this.model.removeCocktailFromBar(cocktailName)
	}
}

Object.extend(Me.prototype, myProto)

})();

;(function(){

var Papa = MyBar, Me = Papa.Controller

var myProto =
{
	bind : function()
	{
		
	},
	
	cocktailQuerySubmit : function(query)
	{
		var cocktail = Cocktail.getByName(query.replace(/(^\s*)|(\s*$)/g,''))
		if(!cocktail) return
		this.model.addCocktailToBar(cocktail)
	},
	
	ingrQuerySubmit : function(query)
	{
		var ingredient = Ingredient.getByName(query.replace(/(^\s*)|(\s*$)/g,''))
		if(!ingredient) return
		this.model.addIngredientToBar(ingredient)
	},
	
	addIngredientToBar : function(ingredient)
	{
		this.model.addIngredientToBar(ingredient)
	},
	
	removeIngredientFromBar : function(ingredient)
	{
		this.model.removeIngredientFromBar(ingredient)
	},
		
	addCocktailToBar : function(cocktail)
	{
		this.model.addCocktailToBar(cocktail)
	},
	
	removeCocktailFromBar : function(cocktail)
	{
		this.model.removeCocktailFromBar(cocktail)
	}
}

Object.extend(Me.prototype, myProto)

})();

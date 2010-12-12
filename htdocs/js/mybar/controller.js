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
	
	addIngredientToBar : function(ingredient)
	{
		this.model.addIngredientToBar(ingredient)
	},
	
	removeIngredientFromBar : function(ingredient)
	{
		this.model.removeIngredientFromBar(ingredient)
	}
}

Object.extend(Me.prototype, myProto)

})();

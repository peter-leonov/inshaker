;(function(){

var Me = CocktailCart.Controller

var myProto =
{
	bind : function()
	{
		
	},
	
	addCocktailToBarMenu : function(cocktailName)
	{
		this.model.addCocktailToBarMenu(cocktailName)
	},
	
	removeCocktailFromBarMenu : function(cocktailName)
	{
		this.model.removeCocktailFromBarMenu(cocktailName)
	}
}

Object.extend(Me.prototype, myProto)

})();

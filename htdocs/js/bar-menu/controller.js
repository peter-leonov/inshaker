;(function(){

var Me = BarMenu.Controller

var myProto =
{
	bind : function()
	{
		
	},
	
	setNewBarName : function(barName)
	{
		this.model.setNewBarName(barName)
	},
	
	getBarName : function()
	{
		return this.model.getBarName()
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

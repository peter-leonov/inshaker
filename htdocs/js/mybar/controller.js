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
	/*
			addCocktailToBar : function(cocktail)
			{
				this.model.addCocktailToBar(cocktail)
			},
			
			removeCocktailFromBar : function(cocktail)
			{
				this.model.removeCocktailFromBar(cocktail)
			},
			*/
			
	switchIngredientsView : function(showType)
	{
		this.model.switchIngredientsView(showType)
	},
	
	switchCocktailsView : function(showType)
	{
		this.model.switchCocktailsView(showType)
	},
	
	hideCocktail : function(cocktail)
	{
		this.model.hideCocktail(cocktail)
	},
	
	showCocktail : function(cocktail)
	{
		this.model.showCocktail(cocktail)
	},
	
	switchTag : function(tag)
	{
		this.model.switchTag(tag)
	},
	
	switchBoShowType : function(showByCocktails)
	{
		this.model.switchBoShowType(showByCocktails)
	},
	
	addIngredientsFromBo : function(ingredients)
	{
		this.model.addIngredientsFromBo(ingredients)
	},
	
	ingredientSelected : function(ingredient)
	{
		this.model.selectIngredient(ingredient)
	},
	
/*	showTagRecommends : function(tag)
	{
		this.model.showTagRecommends(tag)
	},*/

	
	getForeignLink : function()
	{
		this.model.getForeignLink()
	},
	
	upgradeRecommends : function()
	{
		this.model.upgradeRecommends()
	},
	
	addRecommend : function()
	{
		this.model.addRecommend()
	},
	
	addMustHaveRecommend : function()
	{
		this.model.addMustHaveRecommend()
	},
	
	checkoutRecommends : function()
	{
		this.model.checkoutRecommends()
	},
	
	checkoutMustHaveRecommends : function()
	{
		this.model.checkoutMustHaveRecommends()
	}
}
Object.extend(Me.prototype, myProto)
})();

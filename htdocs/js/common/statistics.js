;(function(){

var myName = 'Statistics'

var Me =
{
	cocktailViewRecipe: function (cocktail)
	{
		this.track('cocktail-view-recipe', cocktail.name)
	},
	
	cocktailAddedToCalculator: function (cocktail)
	{
		this.track('cocktail-added-to-calculator', cocktail.name)
	},
	
	toolPopupOpened: function (tool)
	{
		this.track('tool-popup', tool.name)
	},
	
	ingredientPopupOpened: function (ingredient)
	{
		this.track('ingredient-popup', ingredient.name)
	},
	
	ingredientSelected: function (ingredient)
	{
		this.track('ingredient-selected', ingredient.name)
	},
	
	track: function (action, label, value)
	{
		setTimeout(function () { Tracker.track('statistics', action, label, value) }, 500)
	}
}

Me.className = myName
self[myName] = Me

})();
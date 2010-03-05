;(function(){

var myName = 'Statistics'

var Me =
{
	barmanPopupViewed: function (barman)
	{
		this.track('barman-popup-viewed', barman && barman.name)
	},
	
	cocktailsFilterSelected: function (name)
	{
		this.track('cocktails-filter-selected', name)
	},
	
	cocktailViewRecipe: function (cocktail)
	{
		this.track('cocktail-view-recipe', cocktail && cocktail.name)
	},
	
	cocktailAddedToCalculator: function (cocktail)
	{
		this.track('cocktail-added-to-calculator', cocktail && cocktail.name)
	},
	
	toolPopupOpened: function (tool)
	{
		this.track('tool-popup', tool && tool.name)
	},
	
	ingredientPopupOpened: function (ingredient)
	{
		this.track('ingredient-popup', ingredient && ingredient.name)
	},
	
	ingredientSelected: function (ingredient)
	{
		this.track('ingredient-selected', ingredient && ingredient.name)
	},
	
	track: function (action, label, value)
	{
		setTimeout(function () { Tracker.track('statistics', action, label, value) }, 500)
	}
}

Me.className = myName
self[myName] = Me

})();
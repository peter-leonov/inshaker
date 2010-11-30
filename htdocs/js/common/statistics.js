;(function(){

var myName = 'Statistics'

var Me =
{
	magazinePromoViewed: function (promo)
	{
		this.track('magazine-promo-viewed', promo ? promo.name : ('' + promo))
	},
	
	cocktailsFilterSelected: function (name)
	{
		this.track('cocktails-filter-selected', name)
	},
	
	cocktailViewRecipe: function (cocktail)
	{
		this.track('cocktail-view-recipe', cocktail ? cocktail.name : ('' + cocktail))
	},
	
	cocktailAddedToCalculator: function (cocktail)
	{
		this.track('cocktail-added-to-calculator', cocktail ? cocktail.name : ('' + cocktail))
	},
	
	toolPopupOpened: function (tool)
	{
		this.track('tool-popup', tool ? tool.name : ('' + tool))
	},
	
	ingredientPopupOpened: function (ingredient)
	{
		this.track('ingredient-popup', ingredient ? ingredient.name : ('' + ingredient))
	},
	
	ingredientTypedIn: function (ingredient)
	{
		this.track('ingredient-typed-in', ingredient ? ingredient.name : ('' + ingredient))
	},
	
	ingredientSelected: function (ingredient)
	{
		this.track('ingredient-selected', ingredient ? ingredient.name : ('' + ingredient))
	},
	
	combinatorQueryRaw: function (query)
	{
		this.track('combinator-query-raw', query)
	},
	
	combinatorQueryViewed: function (query)
	{
		this.track('combinator-query', query)
	},
	
	track: function (action, label, value)
	{
		setTimeout(function () { Tracker.track('UserAction', action, label, value) }, 500)
	}
}

Me.className = myName
self[myName] = Me

})();
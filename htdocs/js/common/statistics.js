;(function(){

var myName = 'Statistics'

var Me =
{
	magazinePromoViewed: function (promo)
	{
		this.event('magazine-promo-viewed', promo && promo.name)
	},
	
	cocktailsFilterSelected: function (name)
	{
		this.event('cocktails-filter-selected', name)
	},
	
	cocktailViewRecipe: function (cocktail)
	{
		this.event('cocktail-view-recipe', cocktail && cocktail.name)
	},
	
	cocktailViewLegend: function (cocktail)
	{
		this.event('cocktail-view-legend', cocktail && cocktail.name)
	},
	
	cocktailAddedToCalculator: function (cocktail)
	{
		this.event('cocktail-added-to-calculator', cocktail && cocktail.name)
	},
	
	toolPopupOpened: function (tool)
	{
		this.event('tool-popup', tool && tool.name)
	},
	
	ingredientPopupOpened: function (ingredient)
	{
		this.event('ingredient-popup', ingredient && ingredient.name)
	},
	
	ingredientTypedIn: function (ingredient)
	{
		this.event('ingredient-typed-in', ingredient && ingredient.name)
	},
	
	ingredientSelected: function (ingredient)
	{
		this.event('ingredient-selected', ingredient && ingredient.name)
	},
	
	combinatorQueryRaw: function (query)
	{
		this.event('combinator-query-raw', query)
	},
	
	combinatorQueryViewed: function (query)
	{
		this.event('combinator-query', query)
	},
	
	blogTagSelected: function (tag)
	{
		this.event('blog-tag-selected', tag)
	},
	
	partyPrinted: function (party)
	{
		this.path('/party/' + party.path + '/print')
	},
	
	event: function (action, label, value)
	{
		setTimeout(function () { Tracker.event('UserAction', action, label, value) }, 500)
	},
	
	path: function (path)
	{
		setTimeout(function () { Tracker.path(path) }, 500)
	}
}

Me.className = myName
self[myName] = Me

})();
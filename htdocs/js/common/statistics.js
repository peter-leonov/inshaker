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
	
	poll: function (name, value)
	{
		this.path('/user-events/poll/' + name + '/' + value)
	},
	
	event: function (action, label, value)
	{
		window.setTimeout(function () { Tracker.event('UserAction', action, label, value) }, 250)
	},
	
	path: function (path)
	{
		window.setTimeout(function () { Tracker.path(path) }, 250)
	}
}

Me.className = myName
self[myName] = Me

})();
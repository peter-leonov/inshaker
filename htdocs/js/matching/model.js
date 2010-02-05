;(function(){

var Papa = MatchingPage, Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.sources = {}
		this.state = {selected: {}, disabled: {}}
		this.data = {}
	},
	
	bind: function (sources)
	{
		this.sources = sources
		var ingredients = this.data.allIngredients = this.sources.ingredient.getAll()
	},
	
	toggleIngredient: function (ingredient)
	{
		var state = this.state, selected = state.selected,
			name = ingredient.name
		
		// do nothing with disabled ingredient
		if (state.disabled[name])
			return
		
		// toggle selected ingredients
		if (selected[name])
			delete selected[name]
		else
			selected[name] = ingredient
		
		if (Object.isEmpty(selected))
		{
			state.cocktails = []
			state.disabled = {}
		}
		else // make all those calculations only if there is selected ingredients
		{
			// find all suitable cocktails and those ingredients
			var set = this.suitableIngredients(Object.values(selected))
			
			// find out what ingredients must be disable (all - suitable)
			var all = this.data.allIngredients, suitable = set.ingredients,
				disabled = {}
			for (var i = 0, il = all.length; i < il; i++)
			{
				var ingred = all[i]
				if (!suitable[ingred.name])
					disabled[ingred.name] = ingred
			}
			
			state.cocktails = set.cocktails
			state.disabled = disabled
		}
		
		this.sendState()
	},
	
	suitableIngredients: function (ingredients)
	{
		var res = {},
			cocktails = this.sources.cocktail.getByIngredients(ingredients)
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var recipe = cocktails[i].ingredients
			for (var j = 0; j < recipe.length; j++)
				res[recipe[j][0]] = true // [0] is an ingredient name
		}
		
		return {ingredients: res, cocktails: cocktails}
	},
	
	setState: function (state)
	{
		this.state = state
		this.sendState()
	},
	
	sendState: function ()
	{
		var state = this.state
		
		if (state.cocktails && state.cocktails.length)
			state.randomIngredients = null
		else
		{
			var ingredient = this.sources.ingredient,
				ingredients = this.sources.cocktail.getAll().random(1)[0].ingredients.random(3)
			
			for (var i = 0; i < ingredients.length; i++)
				ingredients[i] = ingredient.getByName(ingredients[i][0])
			
			ingredients.sort(ingredient.compareByGroup)
			
			state.randomIngredients = ingredients
		}
		
		this.view.modelChanged(state)
	},
	
	init: function ()
	{
		this.view.renderIngredientsField(this.data.allIngredients)
		this.sendState()
	}
}

Object.extend(Me.prototype, myProto)

})();
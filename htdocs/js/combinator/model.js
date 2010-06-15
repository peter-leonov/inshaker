;(function(){

Array.prototype.hashValues = function ()
{
	var hash = {}
	for (var i = 0, il = this.length; i < il; i++)
		hash[this[i]] = true
	return hash
}

var Papa = CombinatorPage, Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.ds = {}
		this.state = {}
	},
	
	bind: function (ds)
	{
		this.ds = ds
	},
	
	setIngredientsNames: function (add, remove)
	{
		var cocktails = this.searchCocktails(add, remove)
		
		cocktails.sort(function (a, b) { return a.ingredients.length - b.ingredients.length })
		this.view.renderCocktails(cocktails)
	},
	
	searchCocktails: function (add, remove)
	{
		var add = this.filtRealIngredients(add)
		
		var set = this.ds.cocktail.getByIngredientNames(add)
		
		if (!remove.length)
			return set
		
		var remove = this.filtRealIngredients(remove).hashValues()
		
		var cocktails = []
		cocktails: for (var i = 0, il = set.length; i < il; i++)
		{
			var cocktail = set[i],
				recipe = cocktail.ingredients
			
			for (var j = 0, jl = recipe.length; j < jl; j++)
			{
				if (remove[recipe[j]])
					continue cocktails
			}
			
			cocktails.push(cocktail)
		}
		
		return cocktails
	},
	
	filtRealIngredients: function (arr)
	{
		var Ingredient = this.ds.ingredient
		
		var res = []
		for (var i = 0, il = arr.length; i < il; i++)
		{
			var ingredient = Ingredient.getByNameCI(arr[i])
			if (ingredient)
				res.push(ingredient.name)
		}
		return res
	},
	
	setState: function (state)
	{
		this.state = state
		
		// var cocktails = this.ds.cocktail.getByIngredientNames(['Малина'])
		// cocktails.sort(function (a, b) { return a.ingredients.length - b.ingredients.length })
		// this.view.renderCocktails(cocktails)
	}
}

Object.extend(Me.prototype, myProto)

})();
;(function(){

Array.toHash = function(arr)
{
	var hash = {}
	for (var i = 0, il = arr.length; i < il; i++)
		hash[arr[i]] = true
	return hash
}

var Me = CocktailCart.Model
var myProto =
{
	bind : function ()
	{
		var me = this
		BarStorage.initBar(function(bar)
		{
			me.barName = bar.barName
			var hiddenCocktailsHash = Array.toHash(bar.hiddenCocktails)
			me.ingredients = me.getIngredients(bar.ingredients)
			me.cocktails = me.computeCocktails(me.ingredients, hiddenCocktailsHash)
			me.divideCocktails(me.cocktails)
			me.parent.setMainState()
		})
	},
	
	getIngredients : function(ingredientNames)
	{
		var ingredients = []
		ingredients.inBar = {}
		ingredients.inBarNames = ingredientNames
		
		for (var i = 0, il = ingredientNames.length; i < il; i++)
		{
			var ingredient = Ingredient.getByName(ingredientNames[i])
			if(!ingredient)
			{
				continue
			}
			ingredients.push(Ingredient.getByName(ingredientNames[i]))
			ingredients.inBar[ingredientNames[i]] = true
		}
		return ingredients.sort(function(a, b){
			if(a.group != b.group)
				return Ingredient.compareByGroup(a, b)
				
			return a.name.localeCompare(b.name)
		})
	},
	
	computeCocktails : function(ingredients, hiddenCocktailsHash)
	{
		if(Object.isEmpty(ingredients.inBar)) return []
		var needCocktails = Cocktail.getByAnyOfIngredientsNames(ingredients.inBarNames),
			cocktails = []

		ck:
		for ( var i = 0, il = needCocktails.length; i < il; i++ )
		{
			var cocktail = needCocktails[i]
			if(hiddenCocktailsHash[cocktail.name])
			{
				continue
			}
			var ing = cocktail.ingredients
			for (var j = 0, jl = ing.length; j < jl; j++)
			{
				if(!ingredients.inBar[ing[j][0]]) 
					continue ck
			}
			cocktails.push(cocktail)
		}
		
		return cocktails.sort(this.sortCocktails)
	},
	
	sortCocktails : function(a, b)
	{	
		var t = a.ingredients.length - b.ingredients.length
		if(t)
			return t
		
		var ai = a.ingredients,
			bi = b.ingredients,
			al = ai.length,
			bl = bi.length,
			lc = 0
		
		for (var i = 0, il = al < bl ? al : bl; i < il; i++) 
		{
			var aa = Ingredient.getByName(ai[i][0]),
				bb = Ingredient.getByName(bi[i][0])
			
			if(aa.group != bb.group)
				return Ingredient.compareByGroup(aa, bb)
			
			lc = aa.name.localeCompare(bb.name)
			if(lc)
				return lc
		}
		return lc
	},
	
	divideCocktails : function(cocktails)
	{
		var alcoholCocktails = this.alcoholCocktails = [],
			nonAlcoholCocktails = this.nonAlcoholCocktails = []
		
		for (var i = 0, il = cocktails.length; i < il; i++) 
		{
			var cocktail = cocktails[i]
			if(cocktail.tags.indexOf('Безалкогольные') == -1)
			{
				alcoholCocktails.push(cocktail)
			}
			else
			{
				nonAlcoholCocktails.push(cocktail)
			}
		}
	},
	
	setMainState : function()
	{
		this.view.renderBarName(this.barName)
		this.view.renderCocktails(this.alcoholCocktails, this.nonAlcoholCocktails)
	}
}

Object.extend(Me.prototype, myProto)

})();
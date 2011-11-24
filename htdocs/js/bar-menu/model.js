;(function(){

var Me = BarMenu.Model

var myProto =
{
	bind : function ()
	{
		var me = this
		BarStorage.initBar(function(bar){
			me.barName = bar.barName
			me.notAvailableCocktails = bar.notAvailableCocktails		
			me.ingredients = me.getIngredients(bar.ingredients)
			me.cocktails = me.computeCocktails(me.ingredients)
			
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
			ingredients.push(Ingredient.getByName(ingredientNames[i]))
			ingredients.inBar[ingredientNames[i]] = true
		}
		return ingredients.sort(function(a, b){
			if(a.group != b.group)
				return Ingredient.compareByGroup(a, b)
				
			return a.name.localeCompare(b.name)
		})
	},
	
	computeCocktails : function(ingredients)
	{
		if(Object.isEmpty(ingredients.inBar)) return []
		var needCocktails = Cocktail.getByIngredientNames(ingredients.inBarNames, {count : 1}),
			cocktails = []
			
		var al = this.alcoholCocktails = {}

		ck:
		for ( var i = 0, il = needCocktails.length; i < il; i++ )
		{
			var cocktail = needCocktails[i]
			var ing = cocktail.ingredients
			for (var j = 0, jl = ing.length; j < jl; j++)
			{
				if(!ingredients.inBar[ing[j][0]]) 
					continue ck
			}

			cocktails.push(cocktail)
			
			if(cocktail.tags.indexOf('Алкогольные') != -1)
				al[cocktail.name] = true
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
	
	setMainState : function()
	{
		this.view.renderBarName(this.barName)
		this.view.renderBarMenu(this.cocktails, this.notAvailableCocktails, this.alcoholCocktails)
	},
	
	setIngredients : function()
	{
		this.view.renderIngredients(this.ingredients)
	},
	
	saveStorage : function()
	{
		BarStorage.saveBar({ 
			ingredients : this.ingredients.inBarNames,
			notAvailableCocktails : this.notAvailableCocktails
		})
	},
	
	addCocktailToBarMenu : function(cocktailName)
	{
		this.notAvailableCocktails[cocktailName] = null
		this.saveStorage()
		this.view.renderBarMenu(this.cocktails, this.notAvailableCocktails, this.alcoholCocktails)
	},
	
	removeCocktailFromBarMenu : function(cocktailName)
	{
		this.notAvailableCocktails[cocktailName] = true
		this.saveStorage()
		this.view.renderBarMenu(this.cocktails, this.notAvailableCocktails, this.alcoholCocktails)
	}
}

Object.extend(Me.prototype, myProto)

})();
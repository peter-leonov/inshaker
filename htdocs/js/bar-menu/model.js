;(function(){

var Me = BarMenu.Model

var myProto =
{
	bind : function ()
	{
		var me = this, bar = {  ingredients : [], showPhotos : true, barName : '', showByCocktails : true, notAvailableCocktails : {} }
		Storage.init(function(){
			try
			{
				Object.extend(bar, JSON.parse(Storage.get('mybar')))
			}
			catch(e)
			{
			}
			
			
			me.showPhotos = bar.showPhotos
			me.barName = bar.barName
			me.showByCocktails = bar.showByCocktails
			me.notAvailableCocktails = bar.notAvailableCocktails
			
			me.ingredients = me.getIngredients(bar.ingredients)
			me.cocktails = me.computeCocktails(me.ingredients)
			
			me.parent.setBarMenu()
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
				return Ingredient.sortByGroups(a.name, b.name)
				
			return a.name.localeCompare(b.name)
		})
	},
	
	computeCocktails : function(ingredients)
	{
		if(Object.isEmpty(ingredients.inBar)) return []
		var needCocktails = Cocktail.getByIngredientNames(ingredients.inBarNames, {count : 1}),
			cocktails = []

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
				return Ingredient.sortByGroups(aa.name, bb.name)

			lc = aa.name.localeCompare(bb.name)
			if(lc)
				return lc
		}
		return lc
	},
	
	setBarMenu : function()
	{
		this.view.renderBarMenu(this.cocktails, this.notAvailableCocktails)
	},
	
	setIngredients : function()
	{
		this.view.renderIngredients(this.ingredients)
	},
	
	setBarName : function()
	{
		this.view.renderBarName(this.barName)
	},
	
	setNewBarName : function(barName)
	{
		this.barName = barName
		this.saveStorage()
		this.view.renderBarName(barName)
	},
	
	getBarName : function()
	{
		return this.barName
	},
	
	saveStorage : function()
	{
		BarStorage.saveBar({ 
			ingredients : this.ingredients.inBarNames,
			showPhotos : this.showPhotos,
			barName : this.barName,
			showByCocktails : this.showByCocktails,
			notAvailableCocktails : this.notAvailableCocktails
		})
	},
	
	addCocktailToBarMenu : function(cocktailName)
	{
		this.notAvailableCocktails[cocktailName] = null
		this.saveStorage()
		this.view.renderBarMenu(this.cocktails, this.notAvailableCocktails)
	},
	
	removeCocktailFromBarMenu : function(cocktailName)
	{
		this.notAvailableCocktails[cocktailName] = true
		this.saveStorage()
		this.view.renderBarMenu(this.cocktails, this.notAvailableCocktails)
	}
}

Object.extend(Me.prototype, myProto)

})();
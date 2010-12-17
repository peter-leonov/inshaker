;(function(){
	
Array.toHash = function(arr)
{
	var hash = {}
	for (var i = 0, il = arr.length; i < il; i++) 
		hash[arr[i]] = true
	
	return hash
}

Object.toArray = function(obj)
{
	var arr = []
	for( var k in obj )
		if(obj[k])
			arr.push(k)
	
	return arr
}



var Papa = MyBar, Me = Papa.Model

var myProto =
{
	initialize : function()
	{
		this.cocktails = []
		this.ingredients = []
		this.recommends = []
	},
	
	bind : function ()
	{
		var me = this, bar = { cocktails : [], ingredients : [] }
	
		Storage.init(function(){
			try
			{
				Object.extend(bar, JSON.parse(Storage.get('mybar')))
			}
			catch(e)
			{

			}

			//me.getBarFromStorage(bar) //TODO
			
			me.cocktails = me.getCocktails(bar.cocktails)
			
			
			
			me.ingredients = me.getIngredients(me.cocktails, bar.ingredients)
			
			me.recommends = me.computeRecommends(me.cocktails, me.ingredients)
			
			me.parent.setBar()
		})
	},
	
	setCocktails : function()
	{
		this.view.renderCocktails(this.cocktails)
	},
	
	setIngredients : function()
	{
		this.view.renderIngredients(this.ingredients, this.ingredients.inBar)
	},
	
	setRecommends : function()
	{
		this.view.renderRecommends(this.recommends)
	},
	
	getCocktails : function(cocktailNames)
	{
		var cocktails = []
		for (var i = 0, il = cocktailNames.length; i < il; i++)
		{
			cocktails.push(Cocktail.getByName(cocktailNames[i]))
		}

		cocktails.hash = Array.toHash(cocktailNames)

		//cocktails.names = cocktailNames
		return cocktails
	},
	
	getIngredients : function(cocktails, ingredientNames)
	{
		var ingr = {}, inBar = Array.toHash(ingredientNames)
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktailIngr = cocktails[i].ingredients.map(function(a){ return a[0] })
			for( var j = 0; j < cocktailIngr.length; j++ )
				ingr[cocktailIngr[j]] = true
		}
			
		Object.extend(ingr, inBar)
		
		var ingredients = []
		for( var k in ingr )
		{
			ingredients.push(Ingredient.getByName(k))
		}
		
		ingredients.inBar = inBar
		
		return ingredients.sort(function(a,b){ return String.localeCompare(a.name, b.name) })
	},
	
	computeRecommends : function(cocktails, ingredients)
	{
		if(Object.isEmpty(ingredients.inBar)) return []
		
		var needCocktails = Cocktail.getByIngredientNames(Object.toArray(ingredients.inBar), {count : 1}),
			excludes = cocktails.hash,
			recommends = [[],[],[]]
			
		ck:
		for ( var i = 0, il = needCocktails.length; i < il; i++ ) 
		{
			var cocktail = needCocktails[i]
			if(excludes[cocktail.name]) continue 
			var ing = cocktail.ingredients, rl = recommends.length, r
			for (var j = 0, t = -1, jl = ing.length; j < jl; j++) 
			{
				if(ingredients.inBar[ing[j][0]]) t++
				r = j - t //на сколько ингредиентов различаются список ингредиентов(ingredientsHash) с ингредиентами коктейля
				if(r>2) continue ck
			}
			recommends[r].push(cocktail)
		}
		return recommends
	},
	
	saveStorage : function()
	{
		var cocktailNames = this.cocktails.map(function(a){ return a.name }),
			ingredientNames = Object.toArray(this.ingredients.inBar),
			bar = { cocktails : cocktailNames, ingredients : ingredientNames }
		
		Storage.put('mybar', JSON.stringify(bar))
	},
	
	addIngredientToBar : function(ingredient)
	{
		var inBar = this.ingredients.inBar
		if(inBar[ingredient.name]) return
		
		inBar[ingredient.name] = true
		
		this.saveStorage()
		
		this.ingredients = this.getIngredients(this.cocktails, Object.toArray(inBar))
		var recommends = this.computeRecommends(this.cocktails, this.ingredients)
		
		this.view.renderIngredients(this.ingredients, this.ingredients.inBar)
		this.view.renderRecommends(recommends)
	},
	
	addCocktailToBar : function(cocktail)
	{
		if(this.cocktails.hash[cocktail.name]) return //TODO
		this.cocktails.push(cocktail)
		this.cocktails.hash[cocktail.name] = true
		
		this.saveStorage()
		
		this.ingredients = this.getIngredients(this.cocktails, Object.toArray(this.ingredients.inBar))
		var recommends = this.computeRecommends(this.cocktails, this.ingredients)
		
		this.view.renderCocktails(this.cocktails)
		this.view.renderIngredients(this.ingredients, this.ingredients.inBar)
		this.view.renderRecommends(recommends)
	},
	
	removeIngredientFromBar : function(ingredient)
	{
		this.ingredients.inBar[ingredient.name] = null
		
		this.saveStorage()
		
		this.ingredients = this.getIngredients(this.cocktails, Object.toArray(this.ingredients.inBar))
		var recommends = this.computeRecommends(this.cocktails, this.ingredients)
		
		this.view.renderIngredients(this.ingredients, this.ingredients.inBar)
		this.view.renderRecommends(recommends)
	},
	
	removeCocktailFromBar : function(cocktail)
	{
		var pos = this.cocktails.map(function(a){ return a.name }).indexOf(cocktail.name) //TODO
		this.cocktails.splice(pos, 1)
		this.cocktails.hash[cocktail.name] = null

		this.saveStorage()
		
		this.ingredients = this.getIngredients(this.cocktails, Object.toArray(this.ingredients.inBar))
		var recommends = this.computeRecommends()
		
		this.view.renderCocktails(this.cocktails)
		this.view.renderIngredients(this.ingredients, this.inBar)
		this.view.renderRecommends(recommends)
	}
}

Object.extend(Me.prototype, myProto)

})();

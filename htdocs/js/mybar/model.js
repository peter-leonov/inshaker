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
			
			me.cocktails = me.getCocktails(bar.cocktails)
				
			me.ingredients = me.getIngredients(me.cocktails, bar.ingredients)
			
			me.recommends = me.computeRecommends(me.cocktails, me.ingredients)
			
			me.parent.setBar()
		})
	},
	
	setCocktails : function()
	{
		this.view.renderCocktails(this.cocktails, this.ingredients.inBar)
	},
	
	setIngredients : function()
	{
		this.view.renderIngredients(this.ingredients, this.ingredients.inBar)
	},
	
	setRecommends : function()
	{
		this.view.renderRecommends(this.recommends, this.ingredients.inBar)
	},
	
	getCocktails : function(cocktailNames)
	{
		var cocktails = []
		for (var i = 0, il = cocktailNames.length; i < il; i++)
		{
			cocktails.push(Cocktail.getByName(cocktailNames[i]))
		}

		cocktails.hash = Array.toHash(cocktailNames)
		cocktails.names = cocktailNames
		
		cocktails.add = function(cocktail)
		{
			if(this.hash[cocktail.name])
				return false
		
			this.push(cocktail)
			this.names.push(cocktail.name)
			this.hash[cocktail.name] = true
			
			return this
		}
		
		cocktails.remove = function(cocktail)
		{
			var pos = this.names.indexOf(cocktail.name)
			this.splice(pos, 1)
			this.names.splice(pos, 1)
			this.hash[cocktail.name] = null
			
			return this
		}
		
		return cocktails
	},
	
	getIngredients : function(cocktails, ingredientNames)
	{
		var inBar = Array.toHash(ingredientNames), me = this
		
		var ingredients = fetchIngredients(cocktails, inBar)
		ingredients.inBar = inBar
		ingredients.inBarNames = ingredientNames
		
		ingredients.add = function(ingredient)
		{
			if(this.inBar[ingredient.name])
				return false
				
			if(!this.hash[ingredient.name])
			{
				this.hash[ingredient.name] = 1
				this.push(ingredient)
				
				var me = this
				me.sort(function(a,b){ return ingrSorting(a, b, me.hash) })
			}
			
			this.inBar[ingredient.name] = true
			this.inBarNames.push(ingredient.name)
			
			return this
		}
		
		ingredients.remove = function(ingredient)
		{
			this.inBar[ingredient.name] = null
			this.inBarNames = Object.toArray(this.inBar)
			this.length = 0
			
			Object.extend(this, fetchIngredients(me.cocktails, this.inBar))
			
			return this
		}
		
		function fetchIngredients(cocktails, inBar)
		{
			var ingr = {}
			for (var i = 0, il = cocktails.length; i < il; i++)
			{
				var cocktailIngr = cocktails[i].ingredients.map(function(a){ return a[0] })
				for( var j = 0; j < cocktailIngr.length; j++ )
				{
					var n = cocktailIngr[j]
					if(!ingr[n])
						ingr[n] = 2
					else
						ingr[n]++
				}		
			}
			var ingredients = [], hash = {}
			for( var k in ingr )
			{	
				ingredients.push(Ingredient.getByName(k))
				hash[k] = ingr[k]
			}
			for( var k in inBar )
			{
				if(!inBar[k] || ingr[k]) continue
				
				ingredients.push(Ingredient.getByName(k))
				hash[k] = 1
			}
			ingredients.hash = hash
			return ingredients.sort(function(a,b){ return ingrSorting(a, b, ingredients.hash) })
		}
		
		function ingrSorting(a, b, iHash)
		{
			return a.group == b.group ?
				iHash[a.name] == iHash[b.name] ?
						String.localeCompare(a.name, b.name)
						: iHash[a.name] < iHash[b.name] ? 1 : -1
				: Ingredient.sortByGroups(a.name, b.name)			
		}
		
		return ingredients
	},
	
	computeRecommends : function(cocktails, ingredients)
	{
		if(Object.isEmpty(ingredients.inBar)) return []
		
		var needCocktails = Cocktail.getByIngredientNames(ingredients.inBarNames, {count : 1}),
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
				r = j - t
				if(r>2) continue ck
			}
			recommends[r].push(cocktail)
		}
		
		var groups = []
		if(recommends[0].length != 0)
			groups.push({ name : 'Можешь точно приготовить', cocktails : recommends[0] })
		
		if(recommends[1].length != 0)
			groups.push({ name : 'Можешь приготовить, добавив 1 ингредиент', cocktails : recommends[1] })
			
		if(recommends[2].length != 0) groups.push({ name : 'Можешь приготовить, добавив 2 ингредиента', cocktails : recommends[2] })
		
		return groups
	},
	
	saveStorage : function()
	{
		Storage.put('mybar', JSON.stringify({ cocktails : this.cocktails.names, ingredients : this.ingredients.inBarNames }))
	},
	
	addIngredientToBar : function(ingredient)
	{
		if(!this.ingredients.add(ingredient)) return
		
		this.saveStorage()
		
		var recommends = this.computeRecommends(this.cocktails, this.ingredients)
		
		this.view.renderCocktails(this.cocktails, this.ingredients.inBar)
		this.view.renderIngredients(this.ingredients, this.ingredients.inBar)
		this.view.renderRecommends(recommends, this.ingredients.inBar)
	},
	
	addCocktailToBar : function(cocktail)
	{
		if(!this.cocktails.add(cocktail)) return
		
		this.saveStorage()
		
		this.ingredients = this.getIngredients(this.cocktails, this.ingredients.inBarNames)
		var recommends = this.computeRecommends(this.cocktails, this.ingredients)
		
		this.view.renderCocktails(this.cocktails, this.ingredients.inBar)
		this.view.renderIngredients(this.ingredients, this.ingredients.inBar)
		this.view.renderRecommends(recommends, this.ingredients.inBar)
	},
	
	removeIngredientFromBar : function(ingredient)
	{
		this.ingredients.remove(ingredient)
		
		this.saveStorage()
		
		var recommends = this.computeRecommends(this.cocktails, this.ingredients)
		
		this.view.renderCocktails(this.cocktails, this.ingredients.inBar)
		this.view.renderIngredients(this.ingredients, this.ingredients.inBar)
		this.view.renderRecommends(recommends, this.ingredients.inBar)
	},
	
	removeCocktailFromBar : function(cocktail)
	{
		this.cocktails.remove(cocktail)

		this.saveStorage()
		
		this.ingredients = this.getIngredients(this.cocktails, this.ingredients.inBarNames)
		var recommends = this.computeRecommends(this.cocktails, this.ingredients)
		
		this.view.renderCocktails(this.cocktails, this.ingredients.inBar)
		this.view.renderIngredients(this.ingredients, this.ingredients.inBar)
		this.view.renderRecommends(recommends, this.ingredients.inBar)
	}
}

Object.extend(Me.prototype, myProto)

})();

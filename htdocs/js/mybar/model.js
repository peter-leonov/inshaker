;(function(){
	
Array.prototype.toHash = function()
{
	var hash = {}
	for (var i = 0, il = this.length; i < il; i++) 
	{
		hash[this[i]] = true
	}
	return hash
}

var Papa = MyBar, Me = Papa.Model

var myProto =
{
	initialize : function()
	{
		this.cocktails = []
		this.ingredients = []
		this.bar = { cocktails : [], ingredients : [] }
	},
	
	bind : function ()
	{
		var me = this
	
		Storage.init(function(){
			var bar = JSON.parse(Storage.get('mybar'))
			Object.extend(me.bar, bar)	
			me.getBarFromStorage(me.bar)
			me.recommends = me.computeRecommends(me.bar)
			
			me.parent.setBar()
		})
	},
	
	setCocktails : function()
	{
		this.view.renderCocktails(this.cocktails)
	},
	
	setIngredients : function()
	{
		this.view.renderIngredients(this.ingredients)
	},
	
	setRecommends : function()
	{
		this.view.renderRecommends(this.recommends)
	},
	
	fetchIngredints : function(cocktails, ingrNames)
	{
		//collect ingrdients from cocktails
		for (var i = 0, il = cocktails.length, ingr = {}; i < il; i++)
		{
			var cocktailIngr = cocktails[i].ingredients.map(function(a){ return a[0] })
			for( var j = 0; j < cocktailIngr.length; j++ )
				ingr[cocktailIngr[j]] = true
		}
		
		var ingredients = []
		
		for (var i = 0, il = ingrNames.length; i < il; i++)
		{
			var ingredient = Ingredient.getByName(ingrNames[i])
			ingredient.inBar = true
			ingredients.push(ingredient)
			ingr[ingrNames[i]] = null 
		}
		
		for( i in ingr )
		{
			if(!ingr[i]) continue
			ingredient = Ingredient.getByName(i)
			ingredient.inBar = false
			ingredients.push(ingredient)
		}
			
		return ingredients.sort(function(a,b){ return String.localeCompare(a.name, b.name) })
	},
	
	saveStorage : function()
	{
		Storage.put('mybar', JSON.stringify(this.bar))
	},
	
	getBarFromStorage : function(bar)
	{
		this.cocktails = []
		this.ingredients = []
		
		for (var i = 0, il = bar.cocktails.length; i < il; i++)
		{
			this.cocktails.push(Cocktail.getByName(bar.cocktails[i]))
		}

		this.ingredients = this.fetchIngredints(this.cocktails, bar.ingredients)
	},
	
	handleCocktailQuery : function(query)
	{
		var cocktail = Cocktail.getByName(query.replace(/(^\s*)|(\s*$)/g,''))
		if (!cocktail || this.bar.cocktails.indexOf(cocktail.name) != -1) return
		
		this.bar.cocktails.push(cocktail.name)
		this.cocktails.push(cocktail)
		this.saveStorage()
		this.ingredients = this.fetchIngredints(this.cocktails, this.bar.ingredients)
		this.recommends = this.computeRecommends(this.bar)
		
		this.view.renderCocktails(this.cocktails)
		this.view.renderIngredients(this.ingredients)
		this.view.renderRecommends(this.recommends)
	},
	
	handleIngrQuery : function(query)
	{
		var ingredient = Ingredient.getByName(query.replace(/(^\s*)|(\s*$)/g,''))
		if(!ingredient || this.bar.ingredients.indexOf(ingredient.name) != -1) return
		
		this.bar.ingredients.push(ingredient.name)
		this.ingredients.push(ingredient)
		this.saveStorage()
		this.ingredients = this.fetchIngredints(this.cocktails, this.bar.ingredients)
		this.recommends = this.computeRecommends(this.bar)
		
		this.view.renderIngredients(this.ingredients)
		this.view.renderRecommends(this.recommends)
	},
	
	addIngredientToBar : function(ingredientName)
	{
		this.bar.ingredients.push(ingredientName)
		this.ingredients = this.fetchIngredints(this.cocktails, this.bar.ingredients)
		this.saveStorage()
		this.recommends = this.computeRecommends(this.bar)
		
		this.view.renderIngredients(this.ingredients)
		this.view.renderRecommends(this.recommends)
	},
	
	removeIngredientFromBar : function(ingredientName)
	{
		this.bar.ingredients.splice(this.bar.ingredients.indexOf(ingredientName), 1)
		this.ingredients = this.fetchIngredints(this.cocktails, this.bar.ingredients)
		this.saveStorage()
		this.recommends = this.computeRecommends(this.bar)
		
		this.view.renderIngredients(this.ingredients)
		this.view.renderRecommends(this.recommends)
	},
	
	removeCocktailFromBar : function(cocktailName)
	{
		this.bar.cocktails.splice(this.bar.cocktails.indexOf(cocktailName), 1)
		this.getBarFromStorage(this.bar)
		this.saveStorage()
		this.recommends = this.computeRecommends(this.bar)
		
		this.view.renderCocktails(this.cocktails)
		this.view.renderIngredients(this.ingredients)
		this.view.renderRecommends(this.recommends)
	},
	
	addCocktailToBar : function(cocktailName)
	{
		this.bar.cocktails.push(cocktailName)
		this.getBarFromStorage(this.bar)
		this.saveStorage()
		this.recommends = this.computeRecommends(this.bar)
		
		this.view.renderCocktails(this.cocktails)
		this.view.renderIngredients(this.ingredients)
		this.view.renderRecommends(this.recommends)
	},
	
	computeRecommends : function(bar)
	{
		return Cocktail.getForRecommends(bar.ingredients, 3, bar.cocktails.toHash())
	}
}

Object.extend(Me.prototype, myProto)

})();

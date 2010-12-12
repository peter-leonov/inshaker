;(function(){

var Papa = MyBar, Me = Papa.Model

var myProto =
{
	initialize : function()
	{
		Storage.init(function(){})

		//bar contains only string names for cocktail and ingredients. NOT OBJECTS!!!		
		this.bar = JSON.parse(Storage.get('mybar')) || { cocktails : [], ingredients : [] }
		
		//there we take cocktails and ingredients objects
		this.initBarFromStorage(this.bar)
	},
	
	bind : function ()
	{
		if(!this.ingredients.length)
		{
			this.view.renderIfBarEmpty()
			return
		}

		this.view.renderCocktails(this.cocktails)
		this.view.renderIngredients(this.ingredients)
	},
	
	fetchIngredints : function(cocktails, ingrNames)
	{
		if(!cocktails.length) return []
		//collect ingrdients from cocktails
		for (var i = 0, il = cocktails.length, ingr = {}; i < il; i++)
		{
			var cocktailIngr = cocktails[i].ingredients.slice().map(function(a){ return a[0] })
			for( var j = 0; j < cocktailIngr.length; j++ )
				ingr[cocktailIngr[j]] = true
		}
		
		var ingredients = []
		
		for (var i = 0, il = ingrNames.length, ingredient; i < il; i++) 
		{
			ingredient = Ingredient.getByName(ingrNames[i])
			ingredient.inBar = true
			ingredients.push(ingredient)
			delete ingr[ingrNames[i]] 
		}
		
		for( i in ingr )
		{
			ingredient = Ingredient.getByName(i)
			ingredient.inBar =  false
			ingredients.push(ingredient)
		}
			
		return ingredients.sort(function(a,b){ return a.name > b.name ? 1 : -1 })	
	},
	
	saveStorage : function()
	{
		Storage.put('mybar', JSON.stringify(this.bar))
	},
	
	initBarFromStorage : function(bar)
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
		
		this.view.renderCocktails(this.cocktails)
		this.view.renderIngredients(this.ingredients)
	},
	
	handleIngrQuery : function(query)
	{
		var ingredient = Ingredient.getByName(query.replace(/(^\s*)|(\s*$)/g,''))
		if(!ingredient || this.bar.ingredients.indexOf(ingredient.name) != -1) return
		
		this.bar.ingredients.push(ingredient.name)
		this.ingredients.push(ingredient)
		this.saveStorage()
		this.ingredients = this.fetchIngredints(this.cocktails, this.bar.ingredients)
		
		this.view.renderIngredients(this.ingredients)
		
	},
	
	addIngredientToBar : function(ingredient)
	{
		this.bar.ingredients.push(ingredient.name)
		this.ingredients = this.fetchIngredints(this.cocktails, this.bar.ingredients)
		this.saveStorage()
		
		this.view.renderIngredients(this.ingredients)

	},
	
	removeIngredientFromBar : function(ingredient)
	{
		this.bar.ingredients.splice(this.bar.ingredients.indexOf(ingredient.name), 1)
		this.ingredients = this.fetchIngredints(this.cocktails, this.bar.ingredients)
		this.saveStorage()
		
		this.view.renderIngredients(this.ingredients)
	}
}

Object.extend(Me.prototype, myProto)

})();
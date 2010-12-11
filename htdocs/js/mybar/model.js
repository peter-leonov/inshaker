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
		
		for (var i = 0, il = ingrNames.length; i < il; i++) 
		{
			var ingredient = Ingredient.getByName(ingrNames[i])
			ingredient.inBar = true
			ingredients.push(ingredient)
			ingr[ingrNames[i]] = null
		}
		
		for( i in ingr )
		{
			var ingredient = Ingredient.getByName(i)
			ingredient.inBar =  false
			ingredients.push(ingredient)
		}
			
		return ingredients.sort(function(a,b){ return a.name > b.name ? 1 : -1 })	
	},
	
	saveToStorage : function(bar)
	{
		Storage.put('mybar', JSON.stringify(bar))
	},
	
	initBarFromStorage : function(bar)
	{
		var cocktails = this.cocktails = []
		var ingredients = this.ingredients = []
				
		for (var i = 0, il = bar.cocktails.length; i < il; i++) 
		{
			cocktails.push(Cocktail.getByName(bar.cocktails[i]))
		}

		ingredients = this.fetchIngredints(cocktails, bar.ingredients)
	},
	
	handleCocktailQuery : function(query)
	{
		
	},
	
	handleIngrQuery : function(query)
	{
		
	}
}

Object.extend(Me.prototype, myProto)

})();
;(function(){

var Papa = MyBar, Me = Papa.Model

var myProto =
{
	initialize : function()
	{
		Storage.init(function(){})

		//bar contains only string names for cocktail and ingredients. NOT OBJECTS!!!		
		this.bar = JSON.parse(Storage.get('mybar')) || { cocktails : {}, ingredients : {} }
		
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
	
	fetchIngredints : function(cocktails, ingredsInBar)
	{
		if(!cocktails.length) return []
		var ingr = {}
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktailIngr = cocktails[i].ingredients.slice().map(function(a){ return a[0] })
			for( var j = 0; j < cocktailIngr.length; j++ )
				ingr[cocktailIngr[j]] = true
		}
		
		var ingredients = []
		for( i in ingr )
		{
			var ingredient = Ingredient.getByNwame(i)
			ingredient.inBar = ingredsInBar[i] ? true : false
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
				
		for (var i in bar.cocktails) {
			cocktails.push(Cocktail.getByName(i))
		}
		
		ingredients = this.fetchIngredints(cocktails, bar.ingredients)
	}
}

Object.extend(Me.prototype, myProto)

})();
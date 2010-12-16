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
		var haveIngredients = this.bar.ingredients.toHash()
		this.view.renderIngredients(this.ingredients, haveIngredients)
	},
	
	setRecommends : function()
	{
		this.view.renderRecommends(this.recommends)
	},
	
	fetchIngredients : function(cocktails, ingrNames)
	{
		var ingr = {}
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktailIngr = cocktails[i].ingredients.map(function(a){ return a[0] })
			for( var j = 0; j < cocktailIngr.length; j++ )
				ingr[cocktailIngr[j]] = true
		}
		
		var ingredients = []
		
		for (var i = 0, il = ingrNames.length; i < il; i++)
		{
			var ingredient = Ingredient.getByName(ingrNames[i])
			ingredients.push(ingredient)
			ingr[ingrNames[i]] = null 
		}
		
		for( var k in ingr )
		{
			if(!ingr[k]) continue
			ingredient = Ingredient.getByName(k)
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

		this.ingredients = this.fetchIngredients(this.cocktails, bar.ingredients)
	},
	
	addIngredientToBar : function(ingredient)
	{
		if(this.bar.ingredients.indexOf(ingredient.name) != -1) return
		
		this.bar.ingredients.push(ingredient.name)
		
		this.saveStorage()
		
		this.ingredients = this.fetchIngredients(this.cocktails, this.bar.ingredients)
		var haveIngredients = this.bar.ingredients.toHash()
		var recommends = this.computeRecommends(this.bar)
		
		this.view.renderIngredients(this.ingredients, haveIngredients)
		this.view.renderRecommends(recommends)
	},
	
	addCocktailToBar : function(cocktail)
	{
		if(this.bar.cocktails.indexOf(cocktail.name) != -1) return
		
		this.bar.cocktails.push(cocktail.name)
		this.cocktails.push(cocktail)
		
		this.saveStorage()
		
		this.ingredients = this.fetchIngredients(this.cocktails, this.bar.ingredients)
		var haveIngredients = this.bar.ingredients.toHash()
		var recommends = this.computeRecommends(this.bar)
		
		this.view.renderCocktails(this.cocktails)
		this.view.renderIngredients(this.ingredients, haveIngredients)
		this.view.renderRecommends(recommends)
	},
	
	removeIngredientFromBar : function(ingredient)
	{
		this.bar.ingredients.splice(this.bar.ingredients.indexOf(ingredient.name), 1)
		
		this.saveStorage()
		
		this.ingredients = this.fetchIngredients(this.cocktails, this.bar.ingredients)
		var haveIngredients = this.bar.ingredients.toHash()
		var recommends = this.computeRecommends(this.bar)
		
		this.view.renderIngredients(this.ingredients, haveIngredients)
		this.view.renderRecommends(recommends)
	},
	
	removeCocktailFromBar : function(cocktail)
	{
		var pos = this.bar.cocktails.indexOf(cocktail.name)
		this.bar.cocktails.splice(pos, 1)
		this.cocktails.splice(pos, 1)

		this.saveStorage()
		
		this.ingredients = this.fetchIngredients(this.cocktails, this.bar.ingredients)
		var haveIngredients = this.bar.ingredients.toHash()
		var recommends = this.computeRecommends(this.bar)
		
		this.view.renderCocktails(this.cocktails)
		this.view.renderIngredients(this.ingredients, haveIngredients)
		this.view.renderRecommends(recommends)
	},
	
	computeRecommends : function(bar)
	{
		return Cocktail.getForRecommends(bar.ingredients, 3, bar.cocktails.toHash())
	}
}

Object.extend(Me.prototype, myProto)

})();

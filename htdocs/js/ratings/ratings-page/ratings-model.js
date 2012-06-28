;(function(){

function Me () {}

Me.prototype =
{
	initialize: function (rating, ingredients, tags)
	{
		this.setDaysPropertyOnCocktails(rating)
		
		this.ingredients = ingredients.sort()
		this.tags = tags.sort()
		
		this.sortByPos()
	},
	
	stateTotal: function ()
	{
		// switch this state method to the light version
		this.stateTotal = this.stateTotalLight
		
		this.processTotal()
		this.view.switchToFrame('rating-total')
	},
	stateTotalLight: function ()
	{
		this.view.switchToFrame('rating-total')
	},
	
	stateTag: function ()
	{
		// switch this state method to the light version
		this.stateTag = this.stateTagLight
		
		this.processTags()
		this.view.switchToFrame('rating-tag')
	},
	stateTagLight: function ()
	{
		this.view.switchToFrame('rating-tag')
	},
	
	stateIngredient: function ()
	{
		// switch this state method to the light version
		this.stateIngredient = this.stateIngredientLight
		
		this.processIngredients()
		this.view.switchToFrame('rating-ingredient')
	},
	stateIngredientLight: function ()
	{
		this.view.switchToFrame('rating-ingredient')
	},
	
	stateToMethod:
	{
		'rating-total': 'stateTotal',
		'rating-tag': 'stateTag',
		'rating-ingredient': 'stateIngredient'
	},
	defaultStateName: 'stateTotal',
	
	setState: function (state)
	{
		if (state == this.currentState)
			return
		this.currentState = state
		
		this[this.stateToMethod[state] || this.defaultStateName]()
	},
	
	sort: function (a, b)
	{
		return a.days[0] - b.days[0]
	},
	
	setDaysPropertyOnCocktails: function (rating)
	{
		var stub
		for (var k in rating)
		{
			stub = rating[k].slice()
			break
		}
		for (var i = 0, il = stub.length; i < il; i++)
		{
			stub[i] = 999999
		}
		
		var cocktails = Cocktail.getAll()
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			
			cocktail.days = rating[cocktail.name] || stub.slice()
		}
	},
	
	sortByPos: function ()
	{
		this.cocktails = Cocktail.getAll().sort(this.sort)
	},
	
	calculateDirection: function (days)
	{
		for (var i = 0, il = days.length-1; i < il; i++)
		{
			if (days[i] < days[i+1])
				return i + 1
			
			if (days[i] > days[i + 1])
				return (i + 1) * -1
		}
	},
	
	getTopCocktails: function (cocktails)
	{
		var cocktailsDays = []
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			if (this.rating[cocktails[i].name])
			{
				var cocktailObj = {}
				cocktailObj.cocktail = cocktails[i]
				cocktailObj.days = this.rating[cocktails[i].name]
				cocktailsDays.push(cocktailObj)
			}
		}
		return cocktailsDays.sort(this.sort).slice(0, 10)
	},
	
	calculateSpecialDays: function (cocktails)
	{
		for (var i = 0, il = cocktails.length; i < il; i++ )
		{
			var days = cocktails[i].days,
				specialDays = []
			
			for (var j = 0, jl = days.length; j < jl; j++ )
			{
				var sorts = cocktails.slice()
				
				sorts.sort(function(a, b){ return a.days[j] - b.days[j] })
				var pos = sorts.indexOf( cocktails[i] )
				
				specialDays.push(pos)
			}
			
			cocktails[i].specialDays = specialDays
		}
	},
	
	fillDirectionAndPos: function (cocktails)
	{
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			
			cocktail.specialDirection = this.calculateDirection(cocktail.specialDays)
			cocktail.totalDirection = this.calculateDirection(cocktail.days)
			
			var pos = this.cocktails.indexOf(cocktail.cocktail)
			if (pos != -1)
				cocktail.totalPos = pos + 1
		}
	},
	
	
	calculateTotal: function ()
	{
		var cocktails = this.cocktails.slice(0, 10)
		for (var i = 0, il = cocktails.length; i < il; i++)
			cocktails[i].totalDirection = this.calculateDirection(cocktails[i].days)
		
		return cocktails
	},
	
	processTotal: function ()
	{
		this.view.renderTotal(this.calculateTotal())
	},
	
	
	calculateIngredients: function ()
	{
		var res = []
		
		var ingredientsOrTags = this.ingredients
		for (var i = 0, il = ingredientsOrTags.length; i < il; i++)
		{
			var ingredientOrTag = ingredientsOrTags[i]
			
			var ingredients = Ingredient.getByTag(ingredientOrTag)
			if (ingredients.length)
				var cocktails = Cocktail.getByIngredients(ingredients, {count: 1})
			else
				var cocktails = Cocktail.getByIngredient(ingredientOrTag)
			
			if (cocktails.length)
			{
				var byIngr =
				{
					name: ingredientOrTag,
					count: cocktails.length
				}
				
				var cocktailsObj = byIngr.cocktails = this.getTopCocktails(cocktails)
				this.calculateSpecialDays(cocktailsObj)
				this.fillDirectionAndPos(cocktailsObj)
				
				res.push(byIngr)
			}
		}
		
		return res
	},
	
	processIngredients: function ()
	{
		console.time('processIngredients')
		var top = this.calculateIngredients()
		console.timeEnd('processIngredients')
		
		this.view.renderRatingByIngredient(top)
	},
	
	
	calculateTags: function ()
	{
		var res = []
		
		var tags = this.tags
		for (var i = 0, il = tags.length; i < il; i++)
		{
			var tag = tags[i]
			
			var cocktails = Cocktail.getByTag(tag)
			if (!cocktails.length)
				continue
			
			var byTag =
			{
				name: tag,
				count: cocktails.length
			}
			
			var cocktailsObj = byTag.cocktails = this.getTopCocktails(cocktails)
			this.calculateSpecialDays(cocktailsObj)
			this.fillDirectionAndPos(cocktailsObj)
			
			res.push(byTag)
		}
		
		return res
	},
	
	processTags: function ()
	{
		console.time('processIngredients')
		var top = this.calculateTags()
		console.timeEnd('processIngredients')
		
		this.view.renderRatingByTag(top)
	}
}

Papa.Model = Me

})();



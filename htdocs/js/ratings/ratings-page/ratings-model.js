;(function(){

function Me () {}

Me.prototype =
{
	initialize: function (rating, ingredientsOrTags, tags)
	{
		this.setDaysPropertyOnCocktails(rating)
		
		this.ingredientsOrTags = ingredientsOrTags.sort()
		this.tags = tags.sort()
		
		this.sortByPos()
	},
	
	stateTotal: function ()
	{
		// switch this state method to the light version
		this.stateTotal = this.stateTotalLight
		
		this.processTotal()
		this.view.switchToFrame('total')
	},
	stateTotalLight: function ()
	{
		this.view.switchToFrame('total')
	},
	
	stateTag: function ()
	{
		// switch this state method to the light version
		this.stateTag = this.stateTagLight
		
		this.processTags()
		this.view.switchToFrame('tag')
	},
	stateTagLight: function ()
	{
		this.view.switchToFrame('tag')
	},
	
	stateIngredient: function ()
	{
		// switch this state method to the light version
		this.stateIngredient = this.stateIngredientLight
		
		this.processIngredients()
		this.view.switchToFrame('ingredient')
	},
	stateIngredientLight: function ()
	{
		this.view.switchToFrame('ingredient')
	},
	
	stateToMethod:
	{
		total: 'stateTotal',
		tag: 'stateTag',
		ingredient: 'stateIngredient'
	},
	defaultStateName: 'stateTotal',
	
	setState: function (state)
	{
		if (state == this.currentState)
			return
		this.currentState = state
		
		this[this.stateToMethod[state] || this.defaultStateName]()
	},
	
	sortByToday: function (a, b)
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
		this.cocktails = Cocktail.getAll().sort(this.sortByToday)
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
	
	getTopRows: function (cocktails)
	{
		var rows = []
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			
			var row =
			{
				cocktail: cocktail,
				days: cocktail.days
			}
			rows.push(row)
		}
		
		rows.sort(this.sortByToday)
		
		return rows.slice(0, 10)
	},
	
	calculateSpecialDays: function (rows)
	{
		for (var i = 0, il = rows.length; i < il; i++ )
		{
			var days = rows[i].days,
				specialDays = []
			
			for (var j = 0, jl = days.length; j < jl; j++ )
			{
				var sorts = rows.slice()
				
				sorts.sort(function(a, b){ return a.days[j] - b.days[j] })
				var pos = sorts.indexOf(rows[i])
				
				specialDays.push(pos)
			}
			
			rows[i].specialDays = specialDays
		}
	},
	
	fillDirectionAndPos: function (rows)
	{
		for (var i = 0, il = rows.length; i < il; i++)
		{
			var row = rows[i]
			
			row.specialDirection = this.calculateDirection(row.specialDays)
			row.totalDirection = this.calculateDirection(row.days)
			
			var pos = this.cocktails.indexOf(row.cocktail)
			if (pos != -1)
				row.totalPos = pos + 1
		}
	},
	
	
	calculateTotal: function ()
	{
		var rows = this.getTopRows(Cocktail.getAll())
		this.calculateSpecialDays(rows)
		this.fillDirectionAndPos(rows)
		
		return rows
	},
	
	processTotal: function ()
	{
		this.view.renderTotal(this.calculateTotal())
	},
	
	
	calculateIngredients: function ()
	{
		var res = []
		
		var ingredientsOrTags = this.ingredientsOrTags
		for (var i = 0, il = ingredientsOrTags.length; i < il; i++)
		{
			var ingredientOrTag = ingredientsOrTags[i]
			
			var ingredients = Ingredient.getByTag(ingredientOrTag)
			if (ingredients.length)
				var cocktails = Cocktail.getByIngredients(ingredients, {count: 1})
			else
				var cocktails = Cocktail.getByIngredient(ingredientOrTag)
			
			if (!cocktails.length)
				continue
			
			var rows = this.getTopRows(cocktails)
			this.calculateSpecialDays(rows)
			this.fillDirectionAndPos(rows)
			
			var group =
			{
				name: ingredientOrTag,
				count: cocktails.length,
				rows: rows,
			}
			res.push(group)
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
			
			var rows = this.getTopRows(cocktails)
			this.calculateSpecialDays(rows)
			this.fillDirectionAndPos(rows)
			
			var group =
			{
				name: tag,
				count: cocktails.length,
				rows: rows
			}
			res.push(group)
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



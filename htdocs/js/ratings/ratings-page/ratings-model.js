;(function(){

function Me () {}

Me.prototype =
{
	initialize: function (rating, ingredientsOrTags, tags)
	{
		this.setDaysPropertyOnCocktails(rating)
		
		this.ingredientsOrTags = ingredientsOrTags.sort()
		this.tags = tags.sort()
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
			
			var days = rating[cocktail.name] || stub.slice()
			days.direction = this.calculateDirection(days)
			cocktail.days = days
		}
	},
	
	calculateDirection: function (days)
	{
		for (var i = 0, il = days.length - 1; i < il; i++)
		{
			var d = days[i + 1] - days[i]
			if (d != 0)
				return d
		}
		
		return 0
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
		// assume rows had been sorted by first element of days (today)
		
		// preserve original order
		rows = rows.slice()
		
		// bake today position
		for (var i = 0, il = rows.length; i < il; i++)
			rows[i].specialDays = [i]
		
		// bake the rest positions starting from yesterday
		var length = rows[0].days.length
		for (var day = 1; day < length; day++)
		{
			// sort by current day
			rows.sort(function (a, b) { return a.days[day] - b.days[day] })
			
			// save result order
			for (var i = 0, il = rows.length; i < il; i++)
				rows[i].specialDays[day] = i
		}
	},
	
	fillDirectionAndPos: function (rows)
	{
		for (var i = 0, il = rows.length; i < il; i++)
		{
			var row = rows[i]
			row.specialDays.direction = this.calculateDirection(row.specialDays)
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
		var groups = []
		
		var ingredientsOrTags = this.ingredientsOrTags
		for (var i = 0, il = ingredientsOrTags.length; i < il; i++)
		{
			var ingredientOrTag = ingredientsOrTags[i]
			
			var ingredients = Ingredient.getByTag(ingredientOrTag)
			if (ingredients.length)
				var cocktails = Cocktail.getByAnyOfIngredients(ingredients)
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
				rows: rows
			}
			groups.push(group)
		}
		
		return groups
	},
	
	processIngredients: function ()
	{
		// console.time('processIngredients')
		var top = this.calculateIngredients()
		// console.timeEnd('processIngredients')
		
		this.view.renderRatingByIngredient(top)
	},
	
	
	calculateTags: function ()
	{
		var groups = []
		
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
			groups.push(group)
		}
		
		return groups
	},
	
	processTags: function ()
	{
		// console.time('processIngredients')
		var top = this.calculateTags()
		// console.timeEnd('processIngredients')
		
		this.view.renderRatingByTag(top)
	}
}

Papa.Model = Me

})();



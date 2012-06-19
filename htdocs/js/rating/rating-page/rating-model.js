;(function(){

function Me ()
{
	this.defaultFrame = 'rating-total'
}

Me.prototype =
{
	rating: <!--# include virtual="/db/ratings/rating.json" -->,
	ingredients: <!--# include virtual="/db/ratings/ingredients.json" -->,
	tags: <!--# include virtual="/db/ratings/tags.json" -->,
	
	frames:
	{
		'rating-total': function ()
		{
			if (!this.cocktails)
				this.sortByPos()
			
			this.renderByTotal()
			this.view.renderTotal(this.byTotal)
			this.frameChanger('rating-total')
		},

		'rating-tag': function ()
		{
			if (!this.cocktails)
				this.sortByPos()
			
			this.renderByTags()
			this.view.renderCol(this.byTags, 'rating-tag')
			this.frameChanger('rating-tag')
		},

		'rating-ingredient': function ()
		{
			if (!this.cocktails)
				this.sortByPos()
			
			this.renderByIngredients()
			this.view.renderCol(this.byIngredients, 'rating-ingredient')
			this.frameChanger('rating-ingredient')
		}
	},
	
	frameChanger: function (frame)
	{
		var view = this.view
		
		this.frames[frame] = function ()
		{
			view.changeFrame(frame)
		}
		
		this.frames[frame]()
	},
	
	setState: function (state)
	{
		if (!state)
			state = this.defaultFrame
		
		if (!this.frames[state])
			return
		
		this.frames[state].call(this)
	},
	
	sort: function (a, b)
	{
		return a.days[0] - b.days[0]
	},
	
	sortByPos: function ()
	{
		var cocktails = []
		for (var k in this.rating)
		{
			var cocktail = Cocktail.getByName(k)
			
			cocktail.days = this.rating[k]

			cocktails.push(cocktail)
		}
		
		this.cocktails = cocktails.sort(this.sort)
	},
	
	calculateDirection: function (days)
	{
		for (var i = 0, il = days.length-1; i < il; i++)
		{
			if (days[i] < days[i+1])
				return i+1

			if (days[i] > days[i+1])
				return (i+1)*-1
		}
	},
	
	renderByTotal: function ()
	{
		var cocktails = this.byTotal = this.cocktails.slice(0, 10)
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			cocktails[i].totalDirection = this.calculateDirection(cocktails[i].days)
		}
	},
	
	getTopCocktails: function (cocktails)
	{
		var cocktailsDays = []
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			if(this.rating[cocktails[i].name])
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
	
	renderByIngredients: function ()
	{
		var ingredients = this.ingredients,
			byIngredients = this.byIngredients = []
		
		for (var i = 0, il = ingredients.length; i < il; i++)
		{
			var ingr = ingredients[i],
				cocktails = Cocktail.getByIngredient(ingr)
				
			if (cocktails.length)
			{
				var byIngr =
				{
					name: ingr,
					count: cocktails.length
				}
				
				var cocktailsObj = byIngr.cocktails = this.getTopCocktails(cocktails)
				this.calculateSpecialDays(cocktailsObj)
				this.fillDirectionAndPos(cocktailsObj)

				byIngredients.push(byIngr)
			}
		}
	},
	
	renderByTags: function ()
	{
		var tags = this.tags,
			byTags = this.byTags = []
		
		for (var i = 0, il = tags.length; i < il; i++)
		{
			var tag = tags[i],
				cocktails = Cocktail.getByTag(tag)
			
			if (cocktails.length)
			{
				var byTag =
				{
					name: tag,
					count: cocktails.length
				}

				var cocktailsObj = byTag.cocktails = this.getTopCocktails(cocktails)
				this.calculateSpecialDays(cocktailsObj)
				this.fillDirectionAndPos(cocktailsObj)
				
				byTags.push(byTag)
			}
		}
	},
	
	selectIngredient: function (ingredient)
	{
		this.view.showIngredient(ingredient)
	}
}

Papa.Model = Me

})();
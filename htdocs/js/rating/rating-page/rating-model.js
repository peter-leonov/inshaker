;(function(){

function Me () {}

Me.prototype =
{
	rating: <!--# include virtual="/db/ratings/rating.json" -->,
	ingredients: <!--# include virtual="/db/ratings/ingredients.json" -->,
	tags: <!--# include virtual="/db/ratings/tags.json" -->,
	
	sortByPos: function()
	{
		var cocktails = []
		for (var k in this.rating)
		{
			var cocktail = Cocktail.getByName(k)
			
			cocktail.rating = cocktail.rating || {}
			cocktail.rating.days = cocktail.rating.days || this.rating[k]

			cocktails.push(cocktail)
		}
		
		this.cocktails = cocktails.sort(this.sort)
	},
	
	sort: function(a, b)
	{
		return a.rating.days[0] - b.rating.days[0]
	},
	
	addTotalArrow: function()
	{
		var cocktails = this.cocktails.slice(0, 10)
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			this.fillTotalArrow(cocktails[i])
		}
		
		this.view.renderTotal(cocktails.sort(this.sort))
	},
	
	fillTotalArrow: function(cocktail)
	{
		var days = cocktail.rating.days
		
		for (var i = 0, il = days.length-1; i < il; i++)
		{
			if (days[i] < days[i+1])
			{
				cocktail.rating.totalArrow = 'up'
				break
			}
			else if (days[i] > days[i+1])
			{
				cocktail.rating.totalArrow = 'down'
				break
			}
		}
	},
	
	fillTotalPosition: function(cocktail)
	{
		var pos = this.cocktails.indexOf(cocktail)
		if (pos != -1)
			cocktail.rating.totalPos = pos + 1

		this.fillTotalArrow(cocktail)
	},
	
	addArrowByGroup: function(cocktails, type, name)
	{
		var cocktailsDays = []
		for (var j = 0, jl = cocktails.length; j < jl; j++)
		{
			var cocktail = cocktails[j]
			
			if(this.rating[cocktail.name])
			{
				cocktail.rating.days = cocktail.rating.days || this.rating[cocktail.name]
				cocktailsDays.push(cocktail)
			}
		}
		cocktails = cocktailsDays.sort(this.sort).slice(0, 10)
		
		var sorts = []
		for (var j = 0, jl = cocktails.length; j < jl; j++)
		{
			var cocktail = cocktails[j],
				day = 0,
				pos
			
			this.fillTotalPosition(cocktail)
			
			do
			{
				if (!sorts[day])
				{
					sorts[day] = cocktails.slice()
					sorts[day].sort(function(a, b){ return a.rating.days[day+1] - b.rating.days[day+1] })
				}
				pos = sorts[day].indexOf( cocktail )
			}
			while ( j == pos && ++day < 10 )
			
			cocktail.rating[type] = cocktail.rating[type] || {} 
			
			if (j < pos)
				cocktail.rating[type][name] = day+1
			else if (j > pos)
				cocktail.rating[type][name] = (day+1)*-1
		}
		
		return cocktails
	},
	
	addIngredientsArrow: function()
	{
		var ingredients = this.ingredients,
			byIngredients = this.byIngredients = [],
			type = 'ingredient'
		
		for (var i = 0, il = ingredients.length; i < il; i++)
		{
			var ingr = ingredients[i],
				cocktails = Cocktail.getByIngredient(ingr),
				byIngr =
				{
					name: ingr,
					count: cocktails.length,
					cocktails: this.addArrowByGroup(cocktails, type, ingr)
				}

			byIngredients.push(byIngr)
		}
		this.view.renderCol(byIngredients, type)
	},
	
	addTagsArrow: function()
	{
		var tags = this.tags,
			byTags = this.byTags = [],
			type = 'tag'
		
		for (var i = 0, il = tags.length; i < il; i++)
		{
			var tag = tags[i],
				cocktails = Cocktail.getByTag(tag),
				byTag =
				{
					name: tag,
					count: cocktails.length,
					cocktails: this.addArrowByGroup(cocktails, type, tag)
				}

			byTags.push(byTag)
		}
		this.view.renderCol(byTags, type)
	},
	
	selectIngredient: function (ingredient)
	{
		this.view.showIngredient(ingredient)
	}
}

Papa.Model = Me

})();
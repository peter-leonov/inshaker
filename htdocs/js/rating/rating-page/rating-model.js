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
			cocktail.days = this.rating[k]
			cocktails.push(cocktail)
		}
		
		this.cocktails = cocktails.sort(this.sort)
	},
	
	sort: function(a, b)
	{
		return a.days[0] - b.days[0]
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
		var days = cocktail.days
		
		for (var i = 0, il = days.length-1; i < il; i++)
		{
			if (days[i] < days[i+1])
			{
				cocktail.totalArrow = 'up'
				break
			}
			else if (days[i] > days[i+1])
			{
				cocktail.totalArrow = 'down'
				break
			}
		}
	},
	
	fillTotalPosition: function(cocktail)
	{
		cocktail.totalPos = this.cocktails.indexOf(cocktail)
		this.fillTotalArrow(cocktail)
	},
	
	addIngredientsArrow: function()
	{
		var ingredients = this.ingredients,
			byIngredient = this.byIngredient = []
		
		for (var i = 0, il = ingredients.length; i < il; i++)
		{
			var ingr = ingredients[i],
				cocktails = Cocktail.getByIngredient(ingr),
				byIngr =
				{
					name: ingr,
					count: cocktails.length
				}
			
			for (var j = 0, jl = cocktails.length; j < jl; j++)
			{
				var c = cocktails[j]
				
				c.days = this.rating[c.name]
			}
			cocktails = cocktails.sort(this.sort).slice(0, 10)
			
			byIngr.cocktails = cocktails
			
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
						sorts[day].sort(function(a, b){ return a.days[day+1] - b.days[day+1] })
					}
					pos = sorts[day].indexOf( cocktail )
				}
				while ( j == pos && ++day < 10 )
				
				if (j > pos)
					cocktail.ingrArrow = day+1
				else if (j < pos)
					cocktail.ingrArrow = (day+1)*-1
			}
			
			byIngredient.push(byIngr)
		}
		this.view.renderCol(byIngredient)
	}
}

Papa.Model = Me

})();
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
			var c = cocktails[i].days
			
			for (var j = 0, jl = c.length-1; j < jl; j++)
			{
				if (c[j] < c[j+1])
				{
					cocktails[i].totalArrow = 'up'
					break
				}
				else if (c[j] > c[j+1])
				{
					cocktails[i].totalArrow = 'down'
					break
				}
			}
		}
		this.view.renderTotal(cocktails.sort(this.sort))
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
				var c = cocktails[j],
					day = 0,
					pos
				
				do
				{
					if (!sorts[day])
					{
						sorts[day] = cocktails.slice()
						sorts[day].sort(function(a, b){ return a.days[day+1] - b.days[day+1] })
					}
					pos = sorts[day].indexOf( c )
				}
				while ( j == pos && ++day < 10 )
				
				if (j > pos)
					c.ingrArrow = day+1
				else if (j < pos)
					c.ingrArrow = (day+1)*-1
			}
			
			byIngredient.push(byIngr)
		}
	}
}

Papa.Model = Me

})();
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
	
	selectIngredient: function (ingredient)
	{
		this.view.showIngredient(ingredient)
	}
}

Papa.Model = Me

})();
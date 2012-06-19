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
	
	selectIngredient: function (ingredient)
	{
		this.view.showIngredient(ingredient)
	}
}

Papa.Model = Me

})();
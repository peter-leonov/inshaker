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
			var q = {}
			q.name = k
			q.days = this.rating[k]
			cocktails.push(q)
		}
		
		this.cocktails = cocktails.sort(this.sort)
	},
	
	sort: function(a, b)
	{
		return a.days[0] - b.days[0]
	},
	
	addTotalArrow: function()
	{
		var cocktails = this.cocktails.slice(0, 10) // ten cocktails
		
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
	}
}

Papa.Model = Me

})();
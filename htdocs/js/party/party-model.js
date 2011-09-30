;(function(){

function Me ()
{
	this.portions = []
	this.customCounts = []
}

Me.prototype =
{
	setPartyName: function (name)
	{
		this.party = Party.getByName(name)
		
		this.setupPortions(this.party.portions)
	},
	
	selectIngredientName: function (ingredientName)
	{
		var ingredient = Ingredient.getByName(ingredientName)
		if (ingredient)
			this.view.showIngredientPopup(ingredient)
	},
	
	setupPortions: function (source)
	{
		var portions = this.portions = []
		for (var i = 0, il = source.length; i < il; i++)
		{
			var s = source[i]
			portions.push({cocktail: Cocktail.getByName(s.cocktail), factor: s.factor})
		}
		
		this.view.renderPortions(portions)
	},
	
	setupPeaopleCount: function (count)
	{
		this.view.updatePeopleCount(count)
		this.setPeopleCount(count)
	},
	
	setPeopleCount: function (count)
	{
		this.peopleCount = count
		
		var counts = [],
			customCounts = this.customCounts,
			total = 0
		
		var portions = this.portions
		for (var i = 0, il = portions.length; i < il; i++)
		{
			var portion = portions[i]
			var cc = customCounts[i]
			
			var count = cc !== undefined ? cc : Math.ceil(portion.factor * count)
			total += count
			
			counts[i] = {cocktail: portion.cocktail, count: count}
		}
		
		this.view.updatePortions(counts)
	},
	
	setCocktailCount: function (n, v)
	{
		this.customCounts[n] = v
	}
}

Papa.Model = Me

})();

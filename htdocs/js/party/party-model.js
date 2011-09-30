;(function(){

function Me ()
{
	this.portions = []
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
			portions.push({cocktail: Cocktail.getByName(s.cocktail), factor: s.factor, count: 0})
		}
		
		this.view.renderPortions(portions)
	},
	
	setupPeaopleCount: function (count)
	{
		this.view.updatePeopleCount(count)
		this.setPeopleCount(count)
	},
	
	setPeopleCount: function (people)
	{
		this.peopleCount = people
		
		var total = 0
		
		var portions = this.portions
		for (var i = 0, il = portions.length; i < il; i++)
		{
			var portion = portions[i]
			
			var count = portion.count = Math.ceil(portion.factor * people)
			total += count
		}
		
		this.view.updatePortions(portions)
	},
	
	setCocktailCount: function (n, v)
	{
		var portion = this.portions[n]
		portion.count = v
		this.view.updateUnit(n, portion)
	}
}

Papa.Model = Me

})();

;(function(){

function Me ()
{
	this.cocktails = []
	this.customCounts = []
}

Me.prototype =
{
	setPartyName: function (name)
	{
		this.party = Party.getByName(name)
		
		this.setupCocktails(this.party.cocktails)
	},
	
	selectIngredientName: function (ingredientName)
	{
		var ingredient = Ingredient.getByName(ingredientName)
		if (ingredient)
			this.view.showIngredientPopup(ingredient)
	},
	
	setupCocktails: function (source)
	{
		var cocktails = this.cocktails = []
		for (var i = 0, il = source.length; i < il; i++)
		{
			var s = source[i]
			cocktails.push({cocktail: Cocktail.getByName(s.name), factor: s.factor})
		}
		
		// this.view.renderCocktails(cocktails)
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
		
		var cocktails = this.cocktails
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cc = customCounts[i]
			total += counts[i] = cc !== undefined ? cc : Math.ceil(cocktails[i].factor * count)
		}
		
		this.view.updateCocktails(counts)
	},
	
	setCocktailCount: function (n, v)
	{
		this.customCounts[n] = v
	}
}

Papa.Model = Me

})();

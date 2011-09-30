;(function(){

function Me ()
{
	this.portions = []
	this.plan = []
}

Me.prototype =
{
	setPartyName: function (name)
	{
		this.party = Party.getByName(name)
		
		// prepare data, caches, etc.
		this.setupPortions(this.party.portions)
		this.setupPlan(this.portions)
		this.setupPeopleCount(this.party.people)
		
		// init the first cycle
		this.setPeopleCount(this.party.people)
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
	
	setupPeopleCount: function (count)
	{
		this.view.updatePeopleCount(count)
	},
	
	setupPlan: function (portions)
	{
		var buyByName = this.buyByName = {},
			plan = this.plan
		
		for (var i = 0, il = portions.length; i < il; i++)
		{
			var pairs = portions[i].cocktail.ingredients
			
			for (var j = 0, jl = pairs.length; j < jl; j++)
			{
				var name = pairs[j][0]
				
				if (buyByName[name])
					continue
				
				var ingredient = Ingredient.getByName(name)
				
				var best = ingredient.volumes[0],
					costPerUnit = best[1] / best[0]
				
				var buy =
				{
					ingredient: ingredient,
					costPerUnit: costPerUnit,
					amount: 0
				}
				
				plan.push(buy)
				buyByName[name] = buy
			}
		}
		
		plan.sort(function (a, b) { return Ingredient.compareByGroup(a.ingredient, b.ingredient) })
		
		this.view.renderPlan(plan)
	},
	
	setPeopleCount: function (people)
	{
		this.peopleCount = people
		
		var portions = this.portions
		for (var i = 0, il = portions.length; i < il; i++)
		{
			var portion = portions[i]
			portion.count = Math.ceil(portion.factor * people)
		}
		
		this.view.updatePortions(portions)
		
		
		this.calculatePlan(portions)
		this.view.updatePlan(this.plan)
	},
	
	setCocktailCount: function (n, v)
	{
		var portion = this.portions[n]
		portion.count = v
		this.view.updateUnit(n, portion)
	},
	
	calculatePlan: function (portions)
	{
		var amounts = {}
		
		for (var i = 0, il = portions.length; i < il; i++)
		{
			var portion = portions[i]
			
			var count = portion.count,
				parts = portion.cocktail.ingredients
			for (var j = 0, jl = parts.length; j < jl; j++)
			{
				var part = parts[j],
					name = part[0],
					volume = parseFloat(part[1])
				
				var amount = volume * count
				if (amounts[name])
					amounts[name] += amount
				else
					amounts[name] = amount
			}
		}
		
		var buyByName = this.buyByName
		for (var k in amounts)
			buyByName[k].amount = amounts[k]
	}
}

Papa.Model = Me

})();

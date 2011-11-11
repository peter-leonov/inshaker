;(function(){

function Me ()
{
	this.portions = []
	this.plan = []
	this.total = 0
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
		this.view.renderPeopleCount(count)
	},
	
	setupPlan: function (portions)
	{
		var parts = new Cocktail.Parts()
		
		for (var i = 0, il = portions.length; i < il; i++)
		{
			var portion = portions[i]
			
			parts.add(portion.cocktail.getPartsFor(1))
			// portion.parts = parts
			
		}
		
		var buyByName = this.buyByName = {},
			plan = this.plan = []
		
		var ary = parts.toArray()
		for (var j = 0, jl = ary.length; j < jl; j++)
		{
			var good = ary[j].good
			
			var buy =
			{
				good: good,
				amount: 0
			}
			
			plan.push(buy)
			buyByName[good.name] = buy
		}
		
		// plan.sort(function (a, b) { return Ingredient.compareByGroup(a.ingredient, b.ingredient) })
		
		this.view.renderPlan(plan)
	},
	
	setPeopleCount: function (people)
	{
		this.peopleCount = people
		
		var portions = this.portions
		for (var i = 0, il = portions.length; i < il; i++)
		{
			var portion = portions[i]
			portion.count = (portion.factor * people).ceil()
		}
		
		this.view.updatePeopleUnit(people)
		
		this.view.updatePortions(portions)
		
		this.calculatePlan(portions)
		this.view.updatePlan(this.plan)
		
		this.calculateTotal(this.plan)
		this.view.updateTotal(this.total)
	},
	
	setCocktailCount: function (n, v)
	{
		var portions = this.portions
		
		var portion = portions[n]
		portion.count = v
		this.view.updateUnit(n, portion)
		
		this.calculatePlan(portions)
		this.view.updatePlan(this.plan)
		
		this.calculateTotal(this.plan)
		this.view.updateTotal(this.total)
	},
	
	calculatePlan: function (portions)
	{
		var amounts = {}
		
		for (var i = 0, il = portions.length; i < il; i++)
		{
			var portion = portions[i]
			
			var count = portion.count,
				parts = portion.parts
			for (var j = 0, jl = parts.length; j < jl; j++)
			{
				var part = parts[j],
					name = part.good.name,
					dose = part.dose
				
				var amount = (dose * count).ceil(10)
				if (amounts[name])
					amounts[name] += amount
				else
					amounts[name] = amount
			}
		}
		
		var buyByName = this.buyByName
		for (var k in amounts)
		{
			var buy = buyByName[k],
				amount = amounts[k]
			
			buy.amount = amount
			buy.cost = buy.good.getCost(amount).ceil()
			
			var human = Units.humanizeDose(amount, buy.good.unit)
			buy.amountHumanized = human[0].round(10)
			buy.unitHumanized = human[1]
			buy.factorHumanized = human[2]
		}
	},
	
	calculateTotal: function (plan)
	{
		var total = 0
		for (var i = 0, il = plan.length; i < il; i++)
			total += plan[i].cost
		
		this.total = total
	},
	
	setIngredientAmount: function (n, amount)
	{
		var buy = this.plan[n]
		
		amount /= buy.factorHumanized
		
		buy.amount = amount
		buy.cost = buy.good.getCost(amount).ceil()
		
		this.view.updateBuy(n, buy)
		
		this.calculateTotal(this.plan)
		this.view.updateTotal(this.total)
	},
	
	printParty: function ()
	{
		this.view.printParty(this.party)
	}
}

Papa.Model = Me

})();

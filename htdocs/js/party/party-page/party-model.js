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
		
		this.buildPartyList()
		
		// prepare data, caches, etc.
		this.setupPortions(this.party.portions)
		this.setupPlan(this.portions)
		this.setupPeopleCount(this.party.people)
		
		// init the first cycle
		this.setPeopleCount(this.party.people)
	},
	
	selectGoodName: function (name)
	{
		var good = Ingredient.getByName(name)
		if (good)
			this.view.showGoodPopup(good)
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
		this.view.renderRecipes(portions)
	},
	
	setupPeopleCount: function (count)
	{
		this.view.renderPeopleCount(count)
	},
	
	setupPlan: function (portions)
	{
		var parts = this.getPartsFor(portions, this.party.goods, 1)
		
		var buyByName = this.buyByName = {},
			plan = this.plan = []
		
		var ary = parts.toArray()
		ary.sort(function (a, b) { return Ingredient.compareByGroup(a.good, b.good) })
		
		for (var i = 0, il = ary.length; i < il; i++)
		{
			var good = ary[i].good
			
			var buy =
			{
				group: Ingredient.getGroupOfGroup(good.group),
				good: good,
				amount: 0
			}
			
			plan[i] = buy
			buyByName[good.name] = buy
		}
		
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
	},
	
	calculatePlan: function (portions)
	{
		var parts = this.getPartsFor(portions, this.party.goods, this.peopleCount)
		
		var buyByName = this.buyByName
		parts = parts.toArray()
		for (var i = 0, il = parts.length; i < il; i++)
		{
			var part = parts[i],
				amount = part.amount,
				good = part.good
			
			var buy = buyByName[good.name]
			
			buy.amount = amount
			buy.cost = this.getCostForGood(good, amount).cost.ceil()
			
			var human = Units.humanizeDose(amount, good.unit)
			buy.amountHumanized = human[0].round(10)
			buy.unitHumanized = human[1]
			buy.factorHumanized = human[2]
		}
	},
	
	setIngredientAmount: function (name, amount)
	{
		var buy = this.buyByName[name]
		
		amount /= buy.factorHumanized
		
		buy.amount = amount
		buy.cost = this.getCostForGood(buy.good, amount).cost.ceil()
		
		this.view.updateBuy(name, buy)
		
		this.calculateTotal(this.plan)
	},
	
	calculateTotal: function (plan)
	{
		var total = 0
		for (var i = 0, il = plan.length; i < il; i++)
			total += plan[i].cost
		
		this.view.updateTotal(total, (total / this.peopleCount).ceil())
	},
	
	getCostForGood: function (good, amount)
	{
	  var res =
	  {
	    volume: 0,
	    price: 0,
	    tare: '—',
	    count: 0,
	    cost: 0
	  }
	  
		var best = good.volumes[0]
		if (!best) // has no volumes at all
		  return res
		
		res.volume = best[0]
		res.price = best[1]
		
		res.count = Math.ceil(amount / res.volume)
		res.cost = res.count * res.price
		
		return res
	},
	
	
	getPartsFor: function (portions, goods, peopleCount)
	{
		var parts = new CocktailParts()
		
		for (var i = 0, il = portions.length; i < il; i++)
		{
			var portion = portions[i]
			parts.addCocktail(portion.cocktail, portion.count, this.peopleCount)
		}
		
		for (var i = 0, il = goods.length; i < il; i++)
		{
			var good = goods[i]
			parts.addPart(good, 1, 1, this.peopleCount)
		}
		
		return parts
	},
	
	printParty: function ()
	{
		this.view.printParty(this.party)
	},
	
	buildPartyList: function ()
	{
		var iterator = Party.getRandomPartiesIterator()
		
		var parties = []
		while (parties.length < 2)
		{
			var party = iterator(1)[0]
			
			if (!party)
				break
			
			if (party == this.party)
				continue
			
			if (party.hidden)
				continue
			
			parties.push(party)
		}
		
		parties.sort(function (a, b) { return a.people - b.people || a.portions.length - b.portions.length || a.name.localeCompare(b.name) })
		
    this.view.renderPartyList(parties)
	}
}

Papa.Model = Me

})();

;(function(){

function Me (parts)
{
	this.parts = parts || {}
}

Me.prototype =
{
	add: function (b)
	{
		this.addHash(b.parts)
	},
	
	addHash: function (hash)
	{
		for (var k in hash)
		{
			var part = hash[k]
			this.addGood(part.good, part.amount)
		}
	},
	
	addGood: function (good, amount)
	{
		var parts = this.parts
		
		var name = good.name
		
		var a = parts[name]
		if (a)
		{
			a.amount += amount
			return
		}
		
		parts[name] =
		{
			good: good,
			amount: amount
		}
	},
	
	getPartByGood: function (name)
	{
		return this.parts[name]
	},
	
	calculateGoodAmount: function (part, portions, count, guests, has)
	{
		var good = part[0],
			amount = part[1],
			multiplier = part[2]
		
		if (count == 0)
			return 0
		
		
		if (multiplier == 1) // per guest (1)
			return amount * guests
		
		if (!multiplier || multiplier == 2) // helping (undefined, 0 and 2)
			return amount * portions * count
		
		if (multiplier == 3) // per party (3)
		{
			var hasPart = this.getPartByGood(good)
			if (!hasPart)
				return amount
			
			if (hasPart.amount >= amount)
				return 0
			
			return amount - hasPart.amount
		}
		
		// return a save value on an unknown multiplier
		return amount
	},
	
	addPart: function (part, portions, count, guests)
	{
		var amount = this.calculateGoodAmount(part, portions, count, guests)
		this.addGood(Ingredient.getByName(part[0]), amount)
	},
	
	addCocktail: function (cocktail, count, guests)
	{
		var portions = cocktail.portions || 1
		
		var ingredients = cocktail.ingredients
		for (var i = 0, il = ingredients.length; i < il; i++)
		{
			var v = ingredients[i]
			this.addPart(v, portions, count, guests)
		}
		
		var garnish = cocktail.garnish
		for (var i = 0, il = garnish.length; i < il; i++)
		{
			var v = garnish[i]
			this.addPart(v, portions, count, guests)
		}
		
		var tools = cocktail.tools
		for (var i = 0, il = tools.length; i < il; i++)
		{
			var v = tools[i]
			this.addPart(v, portions, count, guests)
		}
	},
	
	toArray: function () { return Object.values(this.parts) }
}

Me.className = 'CocktailParts'
self[Me.className] = Me

})();

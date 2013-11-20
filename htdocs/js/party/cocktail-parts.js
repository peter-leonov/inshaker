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
	
	setGood: function (good, amount)
	{
		this.addGood(good, 0)
		this.parts[good.name].amount = amount
	},
	
	getPartByGood: function (name)
	{
		return this.parts[name]
	},
	
	addPart: function (part, portions, count, guests)
	{
		var good = part[0],
			amount = part[1],
			multiplier = part[2]
		
		var ingredient = Ingredient.getByName(good)
		
		if (count == 0)
		{
			this.addGood(ingredient, 0)
			return
		}
		
		
		if (!multiplier) // per cocktail, pure ingredient (undefined and 0)
		{
			this.addGood(ingredient, amount * count)
			return
		}
		
		if (multiplier == 1) // per guest (1)
		{
			var has = this.getPartByGood(good)
			if (!has)
			{
				this.addGood(ingredient, amount * guests)
				return
			}
			
			if (has.amount >= amount * guests)
				return
			
			this.setGood(ingredient, amount * guests)
			return
		}
		
		if (multiplier == 2) // helping (2)
		{
			this.addGood(ingredient, amount * portions * count)
			return
		}
		
		if (multiplier == 3) // per party (3)
		{
			var has = this.getPartByGood(good)
			if (!has)
			{
				this.addGood(ingredient, amount)
				return
			}
			
			if (has.amount >= amount)
				return
			
			this.setGood(ingredient, amount)
			return
		}
		
		// return a save value on an unknown multiplier
		return amount
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
		
		// var tools = cocktail.tools
		// for (var i = 0, il = tools.length; i < il; i++)
		// {
		// 	var v = tools[i]
		// 	this.addPart(v, portions, count, guests)
		// }
	},
	
	toArray: function () { return Object.values(this.parts) }
}

Me.className = 'CocktailParts'
self[Me.className] = Me

})();

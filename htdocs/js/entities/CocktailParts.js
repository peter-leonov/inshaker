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
	
	toArray: function () { return Object.values(this.parts) }
}

Me.className = 'Parts'
Cocktail[Me.className] = Me

})();

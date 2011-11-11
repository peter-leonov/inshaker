;(function(){

function Me (ingredients)
{
	var parts = this.parts = []
	
	for (var i = 0, il = ingredients.length; i < il; i++)
	{
		var v = ingredients[i]
		
		var part =
		{
			good: Ingredient.getByName(v[0]),
			amount: v[1]
		}
		
		parts.push(part)
	}
	
	this.parts = parts
}

Me.prototype =
{
	toArray: function () { return this.parts.slice() }
}

Me.className = 'Parts'
Cocktail[Me.className] = Me

})();

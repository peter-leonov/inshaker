var Model =
{
	dataListener: null,
	
	init: function (listener)
	{
		this.dataListener = listener
	},
	
	uniqueLetters: function ()
	{
		var names = Ingredient.getAllNames(),
			seen = {}, res = []
		
		for (var i = 0, il = names.length; i < il; i++)
		{
			var letter = names[i].charAt(0)
			if (!seen[letter])
			{
				res.push(letter)
				seen[letter] = true
			}
		}
		
		return res
	},
	
	ingredientsOn: function (letter)
	{
		return Ingredient.getByFirstLetter(letter);
	},
	
	suitableIngredients: function (list)
	{
		var res = [],
			cocktails = Cocktail.getByIngredientNames(list)
		
		for (var i = 0; i < cocktails.length; i++)
		{
			var cocktail = cocktails[i]
			for (var j = 0; j < cocktail.ingredients.length; j++)
				res.push(cocktail.ingredients[j][0]) // [0] is an ingredient name
		}
		
		return {ingredients: res.uniq(), cocktails: cocktails}
	},
	
	selectedListChanged: function (selectedList)
	{
		var set = this.suitableIngredients(selectedList)
		this.dataListener.updateCount(set.cocktails.length, set.ingredients, selectedList.length)
	}
}

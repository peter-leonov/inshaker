;(function(){

var Papa = MatchingPage, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
		this.cache = {ingredients: {}}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		
		
		return this
	},
	
	modelChanged: function (data)
	{
		this.renderIngredientsField(data.ingredients)
	},
	
	renderIngredientsField: function (ingredients)
	{
		var root = this.nodes.alphabetical
		
		// as far as ingredients are alphabeticaly sorted
		var byLetter = this.splitIngredientsByLetter(ingredients),
			letters = Object.keys(byLetter)
		
		for (var i = 0; i < letters.length; i++)
		{
			var letter = letters[i]
			root.appendChild(this.createLetterBox(letter, byLetter[letter]))
		}
	},
	
	splitIngredientsByLetter: function (ingredients)
	{
		// as far as ingredients are alphabeticaly sorted
		var split = {}, letter, array
		for (var i = 0, il = ingredients.length; i < il; i++)
		{
			var ingredient = ingredients[i],
				name = ingredient.name
			
			var ch = name.charAt(0)
			if (ch !== letter)
			{
				array = split[ch] = []
				letter = ch
			}
			
			array.push(ingredient)
		}
		
		return split
	},
	
	createLetterBox: function (letter, ingredients)
	{
		var box = Nc('dl', 'letter-box')
		
		box.appendChild(Nct('dt', 'letter', letter))
		
		var body = N('dd')
		box.appendChild(body)
		
		var list = Nc('ul', 'list')
		body.appendChild(list)
		
		var cache = this.cache.ingredients
		for (var i = 0, il = ingredients.length; i < il; i++)
		{
			var ingredient = ingredients[i],
				iname = ingredient.name
			
			var item = Nc('li', 'item')
			cache[iname] = item
			list.appendChild(item)
			
			var name = Nct('a', 'name', iname)
			name.ingredient = ingredient
			item.appendChild(name)
		}
		
		return box
	}
}

Object.extend(Me.prototype, myProto)

})();
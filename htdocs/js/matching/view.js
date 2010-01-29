;(function(){

var Papa = MatchingPage, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
		this.cache = {ingredients: {}}
		this.selected = {}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		this.bindEvents()
		
		return this
	},
	
	bindEvents: function ()
	{
		var me = this
		this.nodes.alphabetical.addEventListener('click', function (e) { me.ingredientClicked(e) }, false)
	},
	
	ingredientClicked: function (e)
	{
		var ingredient = e.target.ingredient
		if (ingredient)
			this.controller.toggleIngredient(ingredient)
	},
	
	modelChanged: function (data)
	{
		// just an experiment with diff to reduce className usage
		// please see http://kung-fu-tzu.ru/posts/2009/04/03/fabulously-slow-classname/
		var diff = this.diffObjects(this.selected, data.selected),
			cache = this.cache.ingredients
		
		for (var k in diff.add)
			cache[k].addClassName('selected')
		
		for (var k in diff.remove)
			cache[k].removeClassName('selected')
		
		this.selected = Object.copy(data.selected) // flat copying
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
	},
	
	diffObjects: function (a, b)
	{
		var add = {}, change = {}, remove = {}
		
		for (var k in b)
			if (k in a)
			{
				if (a[k] !== b[k])
					change[k] = b[k]
			}
			else
				add[k] = b[k]
		
		for (var k in a)
			if (!(k in b))
				remove[k] = a[k]
		
		return {add: add, change: change, remove: remove}
	}
}

Object.extend(Me.prototype, myProto)

})();
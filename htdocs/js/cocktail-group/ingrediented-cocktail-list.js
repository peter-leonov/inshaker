;(function(){

var Papa

;(function(){

function Me ()
{
	var m = this.model = new Me.Model(),
		v = this.view = new Me.View(),
		c = this.controller = new Me.Controller()
	
	m.view = v
	v.controller = c
	c.model = m
	
	m.parent = v.parent = c.parent = this
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.view.bind(nodes)
	},
	
	setCocktails: function (group)
	{
		this.model.setCocktails(group)
	}
}

Me.className = 'IngredientedCocktailList'
self[Me.className] = Papa = Me

})();


;(function(){

eval(NodesShortcut.include())

function Me ()
{
	this.nodes = {}
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		nodes.more.addEventListener('click', function () { me.controller.moreButtonClicked() }, false)
	},

	renderGroup: function (group)
	{
		var main = this.nodes.main
		main.empty()
		
		var list = Nc('dl', 'group')
		main.appendChild(list)
		
		var nameNode = list.appendChild(Nct('dt', 'group-name', group.name))
		nameNode.appendChild(Nct('span', 'count', '(' + group.rows.length + ')'))

		this.nodes.list = list
		
		this.controller.renderCocktails()
	},
	
	renderRow: function (row, className)
	{
		var item = Nc('li', 'row lines-1 ' + className)
		
		item.appendChild(this.renderCocktail(row.cocktail, row.ingredients))
		this.nodes.list.appendChild(item)
	},
	
	renderCocktail: function (cocktail, ingredients)
	{
		var root = N('dl')
		
		var head = root.appendChild(Nc('dt', 'head'))
		var body = root.appendChild(Nc('dd', 'body'))
		
		head.appendChild(cocktail.getPreviewLink(false, true, false))
		body.appendChild(cocktail.getNameLink())
		
		var recipe = []
		for (var i = 0, il = cocktail.ingredients.length; i < il; i++) 
		{
			var ing = cocktail.ingredients[i]
			var ingObj = Ingredient.getByName(ing[0])
			
			var name = ing[0]
			
			var brand = ingObj.brand
			if (brand)
				name += ' ' + brand
			
			if (Ingredient.groups.indexOf(ingObj.group) < 10)
			{
				var dose = Units.humanizeDose(ing[1], ingObj.unit)
				name += ' ' + dose[0] + ' ' + dose[1]
			}
			
			recipe.push(name)
		}
		var recipeDiv = Nct('div', 'cocktail-recipe', recipe.join(', '))
		
		body.appendChild(recipeDiv)
			
		return root
	},
	
	hideButton: function ()
	{
		var more = this.nodes.more
		
		more.setClassName('hidden')
	}
}

Papa.View = Me

})();

;(function(){

function Me () {}

Me.prototype =
{
	renderCocktails: function ()
	{
		this.model.renderCocktails()
	},
	
	moreButtonClicked: function ()
	{
		this.model.moreButtonClicked()
	}
}

Papa.Controller = Me

})();

;(function(){

function Me ()
{
	this.showRows = 0
	this.group = {}
	this.group.rows = []
}

Me.prototype =
{
	setCocktails: function (group)
	{
		var cocktails = group.cocktails
		
		var rows = []
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
		
			var row = rows[i] = {}
			row.cocktail = cocktail
		
			var ingredients = row.ingredients = []
		
			var recipe = cocktail.ingredients
			for (var k = 0, kl = recipe.length; k < kl; k++)
				ingredients[k] = Ingredient.getByName(recipe[k][0])
		}
		
		var res =
		{
			name: group.name,
			rows: rows
		}
		
		this.group = res
		this.view.renderGroup(res)
	},
	
	renderCocktails: function ()
	{
		var rows = this.group.rows,
			showRows = this.showRows
		
		for (var i = showRows, rl = rows.length, cl = showRows+30; i < rl && i < cl; i++)
		{
			var className = i%2 ? 'even' : 'odd'
			
			this.view.renderRow(rows[i], className)
		}
		
		this.showRows = i
	},
	
	moreButtonClicked: function ()
	{
		var showRows = this.showRows,
			lengthRows = this.group.rows.length

		this.renderCocktails()
			
		if ( showRows >= lengthRows )
			this.view.hideButton()
	}
}

Papa.Model = Me

})();


})();

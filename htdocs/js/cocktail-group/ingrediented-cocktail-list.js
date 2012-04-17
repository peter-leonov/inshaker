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
		
		this.controller.addMoreCocktails()
	},
	
	renderRow: function (row, isEven)
	{
		var item = Nc('li', 'row lines-1 ' + (isEven ? 'even' : 'odd'))
		
		item.appendChild(this.renderCocktail(row.cocktail, row.ingredients, row.recipe))
		this.nodes.list.appendChild(item)
	},
	
	renderCocktail: function (cocktail, ingredients, recipe)
	{
		var a = Nc('a', 'link'),
			root = N('dl')
		
		a.appendChild(root)

		var head = root.appendChild(Nc('dt', 'head')),
			body = root.appendChild(Nc('dd', 'body'))
		
		var htmlName = cocktail.name_eng.htmlName(),
			path = '/cocktail/' + htmlName

		a.href = path + '/'
		
		var img = Nc("img", 'image')
		img['src'] = path + '/' + htmlName + '-big.png'
		head.appendChild(img)
		
		var name = cocktail.name.replace(/ (и|в|во|с|со|на|он|от|без) /g, ' $1 ')
		var span = Nct('span', 'cocktail-name', name)
		body.appendChild(span)
		
		var recipeDiv = Nct('div', 'cocktail-recipe', recipe.join(', '))
		
		body.appendChild(recipeDiv)
			
		return a
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
	addMoreCocktails: function ()
	{
		this.model.addMoreCocktails()
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
	
	addMoreCocktails: function ()
	{
		var rows = this.group.rows,
			showRows = this.showRows
		
		for (var i = showRows, rl = rows.length, cl = showRows+30; i < rl && i < cl; i++)
		{
			var isEven = i%2
			
			rows[i].recipe = this.getRecipe(rows[i].cocktail)
			this.view.renderRow(rows[i], isEven)
		}
		
		this.showRows = i
	},
	
	moreButtonClicked: function ()
	{
		var showRows = this.showRows,
			lengthRows = this.group.rows.length

		this.addMoreCocktails()
			
		if ( showRows >= lengthRows )
			this.view.hideButton()
	},
	
	getRecipe: function (cocktail)
	{
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
		return recipe
	}
}

Papa.Model = Me

})();


})();

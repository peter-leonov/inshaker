;(function(){

var Papa

;(function(){

var myName = 'IngredientedCocktailList',
	Me = Papa = self[myName] = MVC.create(myName)

// Me.mixIn(EventDriven)

var myProto =
{
	initialize: function ()
	{
		this.model.initialize()
		this.view.initialize()
		this.controller.initialize()
	},
	
	bind: function (nodes)
	{
		this.view.bind(nodes)
		
		return this
	},
	
	setCocktails: function (cocktails)
	{
		this.model.setCocktails(cocktails)
	}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.View

eval(NodesShortcut.include())

function joinWithNodeToFragment (arr, node)
{
	var len = arr.length,
		res = document.createDocumentFragment()
	
	if (!len)
		return res
	
	for (var i = 0, il = len - 1; i < il; i++)
	{
		res.appendChild(arr[i])
		res.appendChild(node.cloneNode(true))
	}
	res.appendChild(arr[i])
	
	return res
}

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
	},
	
	renderCocktails: function (rows)
	{
		var main = this.nodes.main
		main.empty()
		
		var list = N('ul')
		
		for (var i = 0, il = rows.length; i < il; i++)
		{
			var item = Nc('li', 'row')
			item.appendChild(this.renderCocktail(rows[i]))
			list.appendChild(item)
		}
		
		main.appendChild(list)
	},
	
	renderCocktail: function (row)
	{
		var cocktail = row.cocktail
		
		var root = N('dl')
		
		var head = root.appendChild(Nc('dt', 'head'))
		head.appendChild(cocktail.getPreviewNode(false, true))
		head.appendChild(Nct('span', 'operator', '='))
		
		var body = root.appendChild(Nc('dd', 'body'))
		
		var ingredients = row.ingredients,
			inodes = []
		for (var i = 0, il = ingredients.length; i < il; i++)
			inodes[i] = ingredients[i].getPreviewNode()
		
		body.appendChild(joinWithNodeToFragment(inodes, Nct('span', 'operator', '+')))
		
		return root
	}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.Controller

var myProto =
{
	initialize: function () {}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.sources = {}
		this.state = {}
	},
	
	setCocktails: function (cocktails)
	{
		this.cocktails = cocktails
		
		var rows = []
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			
			var row = rows[i] = {}
			row.cocktail = cocktail
			
			var ingredients = row.ingredients = []
			
			var recipe = cocktail.ingredients
			for (var j = 0, jl = recipe.length; j < jl; j++)
				ingredients[j] = Ingredient.getByName(recipe[j][0])
			
		}
		
		this.view.renderCocktails(rows)
	}
}

Object.extend(Me.prototype, myProto)

})();


})();

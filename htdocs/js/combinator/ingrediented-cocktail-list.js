;(function(){

var Papa

;(function(){

var myName = 'IngredientedCocktailList',
	Me = Papa = self[myName] = MVC.create(myName)

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
		this.cache = {cocktails:{}}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		
		var t = new Throttler(function () { me.onscroll() }, 100, 500)
		window.addEventListener('scroll', function () { t.call() }, false)
	},
	
	onscroll: function ()
	{
		var frame = this.frame
		if (frame)
			frame.moveTo(window.pageXOffset, window.pageYOffset - 3000)
	},
	
	setupVisibilityFrame: function (nodes)
	{
		if (!nodes.length)
			return
		
		var boxes = Boxer.nodesToBoxes(nodes)
		
		var frame = this.frame = new VisibilityFrame()
		frame.setFrame(4000, 6000) // hardcoded for now
		frame.setStep(500, 500)
		frame.setBoxes(boxes)
		
		var me = this
		frame.onmove = function (show, hide)
		{
			for (var i = 0; i < show.length; i++)
			{
				var box = show[i]
				if (!box.loaded)
				{
					var node = box.node,
						row = node['data-row']
					
					node.appendChild(me.getCocktailNode(row.cocktail, row.ingredients))
					node.removeClassName('lazy')
					
					box.loaded = true
				}
			}
		}
		
		this.onscroll()
	},
	
	renderRows: function (rows)
	{
		var main = this.nodes.main
		main.empty()
		
		var list = N('ul'),
			items = []
		for (var i = 0, il = rows.length; i < il; i++)
		{
			var row = rows[i],
				ingredients = row.ingredients
			
			var item = items[i] = Nc('li', 'row lazy lines-' + ((((ingredients.length - 1) / 5) >> 0) + 1))
			item['data-row'] = row
			list.appendChild(item)
		}
		main.appendChild(list)
		
		this.setupVisibilityFrame(items)
	},
	
	getCocktailNode: function (cocktail, ingredients)
	{
		var cache = this.cache.cocktails,
			name = cocktail.name
		return cache[name] || (cache[name] = this.renderCocktail(cocktail, ingredients))
	},
	
	renderCocktail: function (cocktail, ingredients)
	{
		var root = N('dl')
		
		var head = root.appendChild(Nc('dt', 'head'))
		head.appendChild(cocktail.getPreviewNode(false, true))
		head.appendChild(Nct('span', 'operator', '='))
		
		var body = root.appendChild(Nc('dd', 'body'))
		
		var inodes = []
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
		
		this.view.renderRows(rows)
	}
}

Object.extend(Me.prototype, myProto)

})();


})();

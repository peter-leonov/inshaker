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
	},
	
	wake: function ()
	{
		this.view.wake()
	},
	
	sleep: function ()
	{
		this.view.sleep()
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

var months = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь']

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
		this.onscrollListener = function () { t.call() }
		
		this.wake()
	},
	
	wake: function ()
	{
		window.addEventListener('scroll', this.onscrollListener, false)
	},
	
	sleep: function ()
	{
		window.removeEventListener('scroll', this.onscrollListener, false)
	},
	
	onscroll: function ()
	{
		var frame = this.frame
		if (frame)
			frame.moveTo(window.pageXOffset, window.pageYOffset - 2500)
	},
	
	setupVisibilityFrame: function (nodes)
	{
		if (!nodes.length)
			return
		
		var boxes = Boxer.nodesToBoxes(nodes)
		
		var frame = this.frame = new VisibilityFrame()
		frame.setFrame(4000, 5000) // hardcoded for now
		frame.setStep(4000, 3000)
		frame.moveTo(0, -2500)
		
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
					
					node.appendChild(me.renderCocktail(row.cocktail, row.ingredients))
					node.removeClassName('lazy')
					
					box.loaded = true
				}
			}
		}
		
		frame.setBoxes(boxes)
	},
	
	renderGroups: function (groups)
	{
		var main = this.nodes.main
		main.empty()
		
		var items = []
		for (var i = 0, il = groups.length; i < il; i++)
		{
			var group = groups[i]
			
			var list = Nc('dl', 'group')
			
			var name = group.name
			if (name)
				list.appendChild(Nct('dt', 'group-name', name))
			else
			{
				var date = group.date
				if (date)
					list.appendChild(Nct('dt', 'group-name', months[date.getMonth()] + ' ' + date.getFullYear()))
			}
			
			var rows = group.rows
			for (var j = 0, jl = rows.length; j < jl; j++)
			{
				var row = rows[j],
					ingredients = row.ingredients
				
				var item = Nc('li', 'row lazy lines-' + ((((ingredients.length - 1) / 5) >> 0) + 1))
				items.push(item)
				item['data-row'] = row
				list.appendChild(item)
			}
			main.appendChild(list)
		}
		
		this.setupVisibilityFrame(items)
	},
	
	getCocktailNode: function (cocktail, ingredients)
	{
		var cache = this.cache.cocktails,
			name = cocktail.name
			
		var node = cache[name] || (cache[name] = this.renderCocktail(cocktail, ingredients))
		return node.cloneNode(true)
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
	
	setCocktails: function (groups)
	{
		this.groups = groups
		
		var res = []
		
		for (var i = 0, il = groups.length; i < il; i++)
		{
			var group = groups[i]
			
			var cocktails = group.cocktails
			
			var rows = []
			for (var j = 0, jl = cocktails.length; j < jl; j++)
			{
				var cocktail = cocktails[j]
			
				var row = rows[j] = {}
				row.cocktail = cocktail
			
				var ingredients = row.ingredients = []
			
				var recipe = cocktail.ingredients
				for (var k = 0, kl = recipe.length; k < kl; k++)
					ingredients[k] = Ingredient.getByName(recipe[k][0])
			}
			
			res[i] =
			{
				name: group.name,
				date: group.date,
				rows: rows
			}
		}
		this.view.renderGroups(res)
	}
}

Object.extend(Me.prototype, myProto)

})();


})();

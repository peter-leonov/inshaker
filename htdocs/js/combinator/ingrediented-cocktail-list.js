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

Me.mixIn(EventDriven)

Me.className = 'IngredientedCocktailList'
self[Me.className] = Papa = Me

})();


;(function(){

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

function Me ()
{
	this.nodes = {}
	this.cache = {cocktails:{}}
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		
		this.onclickGroupName = function () { me.groupNameClicked(this['data-group-num']) }
		
		function onscroll ()
		{
			me.onscroll()
		}
		this.onscrollListener = onscroll.throttle(100, 500)
		
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
		frame.setFrame(4000, 5000, 4000, 5000) // hardcoded for now
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
					node.classList.remove('lazy')
					
					box.loaded = true
				}
			}
		}
		
		frame.setBoxes(boxes)
	},
	
	groupNameClicked: function (num)
	{
		this.controller.groupNameClicked(num)
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
			main.appendChild(list)
			
			var head
			
			var name = group.name
			if (name)
				head = name
			else
			{
				var date = group.date
				if (date)
					head = months[date.getMonth()] + ' ' + date.getFullYear()
			}
			
			if (head)
			{
				var nameNode = list.appendChild(Nct('dt', 'group-name', head))
				nameNode.appendChild(Nct('span', 'count', '(' + group.rows.length + ')'))
				nameNode.addEventListener('click', this.onclickGroupName, false)
				nameNode['data-group-num'] = i
			}
			
			if (group.collapsed)
			{
				list.classList.add('collapsed')
				continue
			}
			else
				list.classList.remove('collapsed')
			
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

Papa.View = Me

})();


;(function(){

function Me () {}

Me.prototype =
{
	groupNameClicked: function (num) { this.model.toggleGroupCollapsedility(num) }
}

Papa.Controller = Me

})();


;(function(){

function Me () {}

Me.prototype =
{
	setCocktails: function (groups)
	{
		this.rawGroups = groups
		
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
		
		this.groups = res
		this.view.renderGroups(res)
	},
	
	toggleGroupCollapsedility: function (num)
	{
		var groups = this.groups
		
		var group = groups[num]
		if (!group)
			return
		
		group.collapsed = !group.collapsed
		
		this.view.renderGroups(groups)
	}
}

Papa.Model = Me

})();


})();

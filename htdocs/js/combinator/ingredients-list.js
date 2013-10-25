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
	
	setIngredients: function (ingredients)
	{
		this.model.setIngredients(ingredients)
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

Me.className = 'IngredientsList'
self[Me.className] = Papa = Me

})();


;(function(){

eval(NodesShortcut.include())

function Me ()
{
	this.nodes = {}
	this.ingredientCache = {}
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		
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
	
	renderIngredients: function (groups)
	{
		var main = this.nodes.main
		main.empty()
		
		this.itemCache = []
		
		// console.time('render')
		for (var i = 0; i < groups.length; i++)
		{
			var group = this.renderGroup(groups[i])
			main.appendChild(group)
		}
		// console.timeEnd('render')
		
		// console.time('setupVisibilityFrame')
		this.setupVisibilityFrame(this.itemCache)
		// console.timeEnd('setupVisibilityFrame')
	},
	
	setupVisibilityFrame: function (nodes)
	{
		if (!nodes.length)
			return
		
		var boxes = Boxer.sameNodesToBoxes(nodes)
		
		var frame = this.frame = new VisibilityFrame()
		frame.setFrame(4000, 5000) // hardcoded for now
		frame.setStep(4000, 3000)
		frame.moveTo(0, -2500)
		
		frame.onmove = function (show, hide)
		{
			for (var i = 0; i < show.length; i++)
			{
				var box = show[i]
				if (!box.loaded)
				{
					box.node.ingredientNode.unLazy()
					box.loaded = true
				}
			}
		}
		
		frame.setBoxes(boxes)
	},
	
	
	renderGroup: function (group)
	{
		var root = Nc('dl', 'group')
		
		if ('name' in group)
		{
			var dt = Nc('dt', 'head')
			dt.innerHTML = group.name
			root.appendChild(dt)
		}
		
		var body = Nc('dt', 'body')
		root.appendChild(body)
		
		var list = Nc('ul', 'list')
		var ingreds = group.list, itemCache = this.itemCache
		for (var i = 0; i < ingreds.length; i++)
		{
			var item = Nc('li', 'item lazy')
			itemCache.push(item)
			var ingredientNode = this.getIngredientNode(ingreds[i])
			item.appendChild(ingredientNode)
			item.ingredientNode = ingredientNode
			list.appendChild(item)
		}
		body.appendChild(list)
		
		return root
	},
	
	getIngredientNode: function (ingredient)
	{
		if ((node = this.ingredientCache[ingredient.name]))
			return node
		
		return this.ingredientCache[ingredient.name] = ingredient.getPreviewNodeLazy()
	}
}

Papa.View = Me

})();


;(function(){

function Me () {}

Papa.Controller = Me

})();


;(function(){

function Me ()
{
	this.groups = []
}

Me.prototype =
{
	setIngredients: function (groups)
	{
		this.groups = groups
		this.view.renderIngredients(groups)
	}
}

Papa.Model = Me

})();


})();

;(function(){

var Papa

;(function(){

var myName = 'IngredientsList',
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

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
		this.ingredientCache = {}
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
		
		this.setupVisibilityFrame(this.itemCache)
	},
	
	setupVisibilityFrame: function (nodes)
	{
		if (!nodes.length)
			return
		
		var boxes = Boxer.sameNodesToBoxes(nodes)
		
		var frame = this.frame = new VisibilityFrame()
		frame.setFrame(4000, 5000) // hardcoded for now
		frame.setStep(4000, 3000)
		frame.setBoxes(boxes)
		
		frame.onmove = function (show, hide)
		{
			for (var i = 0; i < show.length; i++)
			{
				var box = show[i]
				if (!box.loaded)
				{
					var node = box.node,
						image = node.ingredientNode.ingredientImage
					
					image.src = image.lazySrc
					node.removeClassName('lazy')
					
					box.loaded = true
				}
			}
		}
		
		this.onscroll()
	},
	
	
	renderGroup: function (group)
	{
		var root = Nc('dl', 'group')
		
		if ('name' in group)
			root.appendChild(Nct('dt', 'head', group.name))
		
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
		
		return this.ingredientCache[ingredient.name] = ingredient.getPreviewNode(true)
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
		this.groups = []
	},
	
	setIngredients: function (groups)
	{
		this.groups = groups
		this.view.renderIngredients(groups)
	}
}

Object.extend(Me.prototype, myProto)

})();


})();

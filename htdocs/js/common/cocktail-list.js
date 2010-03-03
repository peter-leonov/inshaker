;(function(){

function Me ()
{
	this.nodes = {}
	this.previewsCache = {}
	this.constructor = Me
	this.data = {cocktails:[]}
}

Me.className = 'CocktailList'

// eval(NodesShortcut())

Me.prototype =
{
	pageVelocity: 20,
	pageLength: 1,
	friction: 60,
	soft: 7,
	
	bind: function (nodes, cocktails)
	{
		this.nodes = nodes
		
		this.bindScroller()
		this.navigate()
		
		return this
	},
	
	bindScroller: function ()
	{
		var nodes = this.nodes,
			surface = nodes.surface, viewport = nodes.viewport
		
		var frame = this.frame = new VisibilityFrame()
		frame.setStep(500, 500)
		
		frame.onmove = function (show, hide)
		{
			for (var i = 0; i < show.length; i++)
			{
				var box = show[i]
				if (!box.loaded)
				{
					var node = box.node,
						image = node.img
					
					image.src = image.lazySrc
					node.removeClassName('lazy')
					
					box.loaded = true
				}
			}
		}
		
		var scroller = this.scroller = new InfiniteScroller()
		scroller.bind(viewport)
		
		var space = scroller.space
		space.add(new Kinematics.Friction(this.friction))
		this.wave = space.add(new Kinematics.Wave(0, 0, 0))
	},
	
	setCocktails: function (cocktails)
	{
		this.data.cocktails = cocktails
		this.render()
	},
	
	getCocktailPreviewNode: function (cocktail)
	{
		var name = cocktail.name,
			previewsCache = this.previewsCache
		
		var preview = previewsCache[name]
		if (!preview)
			preview = previewsCache[name] = cocktail.getPreviewNode(true)
		
		return preview
	},
	
	render: function ()
	{
		
		var nodes = this.nodes, root = nodes.root, surface = nodes.surface, viewport = nodes.viewport,
			cocktails = this.data.cocktails
		
		root.show()
		surface.empty()
		
		// console.time('render')
		
		var nodes = []
		
		var scroller = this.scroller
		scroller.reset()
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var preview = this.getCocktailPreviewNode(cocktails[i])
			surface.appendChild(preview)
			nodes.push(preview)
		}
		
		var page = this.pageLength
		if (cocktails.length >= page)
		{
			for (var j = 0; j < page; j++)
			{
				// we can't use getCocktailPreviewNode() here
				// because it returns the same node in every call
				// but we need a copy
				var preview = cocktails[j].getPreviewNode()
				surface.appendChild(preview)
			}
			root.removeClassName('single')
			
			var clientWidth = preview.clientWidth
			this.scroller.setWidth(clientWidth * i)
			this.wave.setup(clientWidth, this.soft, this.friction)
			scroller.setMovable(true)
		}
		else
		{
			root.addClassName('single')
			scroller.setMovable(false)
		}
		
		this.setupVisibilityFrame(root, nodes)
		
		// console.timeEnd('render')
	},
	
	setupVisibilityFrame: function (root, nodes)
	{
		var frame = this.frame,
			boxes = []
		
		var first = nodes[0]
		if (first)
		{
			var width = first.offsetWidth,
				height = first.offsetHeight
			
			for (var i = 0, il = nodes.length; i < il; i++)
			{
				boxes[i] =
				{
					x: width * i,
					y: 0,
					w: width,
					h: height,
					node: nodes[i]
				}
			}
		}
		
		var frameWidth = root.offsetWidth
		
		var timer
		this.scroller.onscroll = function (x, realX)
		{
			// frame.moveTo(realX, 0)
			clearTimeout(timer)
			timer = setTimeout(function () { frame.moveTo(realX - frameWidth, 0) }, 100)
		}
		
		frame.setFrame(frameWidth * 3, root.offsetHeight)
		frame.setBoxes(boxes)
		frame.moveTo(0, 0)
	},
	
	navigate: function ()
	{
		var nodes = this.nodes
		
		var me = this
		nodes.prev.addEventListener('click', function (e) { me.goPrev() }, false)
		nodes.next.addEventListener('click', function (e) { me.goNext() }, false)
	},
	
	goPrev: function ()
	{
		this.scroller.setVelocity(-this.pageVelocity, 0)
		this.scroller.run()
	},
	
	goNext: function ()
	{
		this.scroller.setVelocity(this.pageVelocity, 0)
		this.scroller.run()
	}
}

// Me.mixIn(EventDriven)
self[Me.className] = Me

})();
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
	pageVelocity: 38,
	pageLength: 3,
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
		frame.setFrame(4000, 1500) // hardcoded for now
		frame.setStep(500, 500)
		
		frame.onmove = function (show, hide)
		{
			for (var i = 0; i < show.length; i++)
			{
				var node = show[i].node,
					image = node.img
				if (!image.src)
				{
					image.src = image.lazySrc
					node.removeClassName('lazy')
				}
			}
		}
		
		var scroller = this.scroller = new InfiniteScroller()
		scroller.bind(viewport)
		scroller.onscroll = function (x, realX) { frame.moveTo(realX, 0) }
		
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
		var nodes = this.nodes, surface = nodes.surface, viewport = nodes.viewport,
			cocktails = this.data.cocktails
		
		nodes.root.show()
		
		surface.empty()
		
		var scroller = this.scroller
		scroller.reset()
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var preview = this.getCocktailPreviewNode(cocktails[i])
			surface.appendChild(preview)
		}
		
		var page = this.pageLength
		if (cocktails.length >= page)
		{
			for (var j = 0; j < page; j++)
			{
				var preview = cocktails[j].getPreviewNode(true)
				surface.appendChild(preview)
			}
			nodes.root.removeClassName('single')
			
			var clientWidth = preview.clientWidth
			this.scroller.setWidth(clientWidth * i)
			this.wave.setup(clientWidth, this.soft, this.friction)
			scroller.setMovable(true)
		}
		else if (cocktails.length)
		{
			nodes.root.addClassName('single')
			scroller.setMovable(false)
		}
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
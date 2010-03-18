;(function(){

function Me ()
{
	this.nodes = {}
	this.constructor = Me
}

Me.className = 'LazyList'

Me.prototype =
{
	pageVelocity: 20,
	pageLength: 1,
	friction: 60,
	soft: 7,
	stepX: 500,
	stepY: 500,
	throttle: 100,
	load: function () {},
	
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
		frame.setStep(this.stepX, this.stepY)
		
		frame.onmove = function (show, hide)
		{
			var load = []
			for (var i = 0; i < show.length; i++)
			{
				var box = show[i]
				if (!box.loaded)
				{
					load.push(box.node)
					box.loaded = true
				}
			}
			
			this.load(load)
		}
		
		var scroller = this.scroller = new InfiniteScroller()
		scroller.bind(viewport)
		
		var space = scroller.space
		space.add(new Kinematics.Friction(this.friction))
		this.wave = space.add(new Kinematics.Wave(0, 0, 0))
	},
	
	setNodes: function (nodes, realCount)
	{
		var n = this.nodes, root = n.root, surface = n.surface, viewport = n.viewport
		
		var boxes = Boxer.sameNodesToBoxes(nodes, viewport)
		
		var frame = this.frame,
			frameWidth = viewport.offsetWidth,
			timer
		this.scroller.onscroll = function (x, realX)
		{
			clearTimeout(timer)
			timer = setTimeout(function () { frame.moveTo(realX - frameWidth, 0) }, this.throttle)
		}
		
		frame.setFrame(frameWidth * 3, viewport.offsetHeight)
		frame.setBoxes(boxes)
		frame.moveTo(0, 0)
		
		
		root.show()
		surface.empty()
		
		var scroller = this.scroller
		scroller.reset()
		
		
		if (boxes.length >= this.pageLength)
		{
			root.removeClassName('single')
			
			var last = boxes[realCount - 1]
			this.scroller.setWidth(last.x + last.w)
			this.wave.setup(last.w, this.soft, this.friction)
			scroller.setMovable(true)
		}
		else
		{
			root.addClassName('single')
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
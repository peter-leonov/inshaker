;(function(){

function Me ()
{
	this.nodes = {}
	this.boxes = []
	this.conf =
	{
		// precalculated velocity that must be applied to go to the next page
		pageVelocity: 20,
		
		// nodes on one page, list becomes active or inactive (single) relying on this
		pageLength: 1,
		
		// just a friction to be set in the scroller space
		friction: 60,
		
		// how much soften will wave be
		soft: 10,
		
		// steps of the gridder, defaults are nive enough
		stepX: 500,
		stepY: 500,
		
		// the time to wait the next onscroll event before take any actions
		throttle: 100
	}
	this.constructor = Me
}

Me.className = 'LazyList'

Me.prototype =
{
	// a callback for nodes must be loaded
	load: function () {},
	
	configure: function (conf)
	{
		Object.extend(this.conf, conf)
		
		conf = this.conf
		if (conf.min === undefined)
			conf.min = conf.friction * 2
	},
	
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
		frame.setStep(this.conf.stepX, this.conf.stepY)
		
		var me = this
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
			
			me.load(load)
		}
		
		var scroller = this.scroller = new InfiniteScroller()
		scroller.bind(viewport)
		
		var space = scroller.space
		space.add(new Kinematics.Friction(this.conf.friction))
		this.wave = space.add(new Kinematics.Wave(0, 0, 0))
	},
	
	setNodes: function (nodes, realCount)
	{
		var n = this.nodes, root = n.root, surface = n.surface, viewport = n.viewport,
			conf = this.conf
		
		var boxes = this.boxes = Boxer.sameNodesToBoxes(nodes, viewport)
		
		var frame = this.frame,
			frameWidth = viewport.offsetWidth,
			timer
		this.scroller.onscroll = function (x, realX)
		{
			clearTimeout(timer)
			timer = setTimeout(function () { frame.moveTo(realX - frameWidth, 0) }, conf.throttle)
		}
		
		frame.setFrame(frameWidth * 3, viewport.offsetHeight)
		frame.setBoxes(boxes)
		frame.moveTo(0, 0)
		
		
		root.show()
		
		var scroller = this.scroller
		scroller.reset()
		
		if (realCount >= conf.pageLength)
		{
			root.removeClassName('single')
			root.removeClassName('empty')
			
			var last = boxes[realCount - 1]
			this.scroller.setWidth(last.x + last.w)
			this.wave.setup(last.w, conf.soft, conf.min)
			scroller.setMovable(true)
		}
		else if (realCount == 0)
		{
			root.removeClassName('single')
			root.addClassName('empty')
			scroller.setMovable(false)
		}
		else
		{
			root.addClassName('single')
			root.removeClassName('empty')
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
		this.scroller.setVelocity(-this.conf.pageVelocity, 0)
		this.scroller.run()
	},
	
	goNext: function ()
	{
		this.scroller.setVelocity(this.conf.pageVelocity, 0)
		this.scroller.run()
	},
	
	jumpToNode: function (node)
	{
		var boxes = this.boxes
		SEARCH:
		{
			for (var i = 0, il = boxes.length; i < il; i++)
			{
				var box = boxes[i]
				if (box.node == node)
					break SEARCH
			}
			return
		}
		
		var box = boxes[i - i % this.conf.pageLength]
		if (box)
			this.scroller.setX(box.x)
	}
}

self[Me.className] = Me

})();
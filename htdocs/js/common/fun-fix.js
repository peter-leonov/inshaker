;(function(){

function Me ()
{
	this.top = 0
	this.height = 0
	this.y = 0
	this.dy = 0
	
	for (var k in this.states)
		this.states[k].stateName = k
	
	this.state = this.states.initial
}

Me.prototype =
{
	bind: function (node)
	{
		this.node = node
		
		var pos = node.offsetPosition(document.documentElement)
		this.offsetTop = pos.top
		this.height = node.offsetHeight
	},
	
	states:
	{
		initial: function ()
		{
			if (this.y > 0)
				return this.switchState('down')
		},
		up_to_initial: function ()
		{
			this.node.style.top = 0
		},
		
		
		down: function ()
		{
			if (this.y < this.lastY)
				return this.switchState('up')
		},
		
		
		up: function ()
		{
			if (this.y <= 0)
				return this.switchState('initial')
			
			if (this.y > this.lastY)
				return this.switchState('down')
			
			
		},
		down_to_up: function ()
		{
			this.lastTop = this.lastY
			this.node.style.top = this.lastY - this.height + 'px'
		}
	},
	
	switchState: function (name)
	{
		var transition = this.states[this.state.stateName + '_to_' + name]
		if (transition)
		{
			log(this.state.stateName + ' -> ' + name)
			transition.call(this)
		}
		
		this.state = this.states[name]
		log(this.state.stateName + '?')
		if (this.state() !== false)
			log(this.state.stateName + '!')
		
		return false
	},
	
	windowScrolled: function (y)
	{
		y -= this.offsetTop
		this.y = y
		log(this.state.stateName + '?')
		if (this.state() !== false)
			log(this.state.stateName + '!')
		this.lastY = y
	},
	
	windowScrolled1: function (y)
	{
		var far = y > this.top
		
		var node = this.node
		
		if (far)
		{
			var height = this.height
			
			var dy = this.dy + this.y - y
			if (dy < -height)
				dy = -height
			else if (dy > 0)
				dy = 0
			
			this.dy = dy
			
			node.style.top = dy + 'px'
		}
		else
		{
			node.style.top = 0
		}
		
		this.y = y
		
		var lastFar = this.lastFar
		
		// the most recent case
		if (far == lastFar)
			return
		
		this.lastFar = far
		
		if (!lastFar && far)
			node.addClassName('fixed')
		else if (lastFar && !far)
			node.removeClassName('fixed')
	}
}

Me.className = 'FunFix'
self[Me.className] = Me

})();
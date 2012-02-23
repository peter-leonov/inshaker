;(function(){

function Me ()
{
	for (var k in this.states)
		this.states[k].stateName = k
	
	this.state = this.states.initial
}

Me.prototype =
{
	bind: function (node)
	{
		this.node = node
		this.style = node.style
		
		this.offsetHeight = node.offsetHeight
		
		this.initialTop = node.offsetTop
		this.top = this.initialTop
		
		var pos = node.offsetPosition(document.documentElement)
		this.topCompensation = pos.top - this.initialTop
	},
	
	setTop: function (top)
	{
		this.top = top
		this.style.top = top + 'px'
	},
	
	states:
	{
		initial: function ()
		{
			if (this.y > this.offsetHeight + this.initialTop)
				return this.switchState('down')
		},
		up_to_initial: function ()
		{
			this.setTop(this.initialTop)
		},
		fixed_to_initial: function ()
		{
			this.node.removeClassName('fixed')
			this.setTop(this.initialTop)
		},
		
		
		down: function ()
		{
			if (this.y < this.lastY)
				return this.switchState('up')
			
			if (this.top + this.offsetHeight < this.y)
				return this.switchState('hidden')
		},
		fixed_to_down: function ()
		{
			this.node.removeClassName('fixed')
			this.setTop(this.lastY)
		},
		
		
		hidden: function ()
		{
			if (this.y < this.lastY)
				return this.switchState('up')
		},
		
		up: function ()
		{
			if (this.y <= this.initialTop)
				return this.switchState('initial')
			
			if (this.y > this.lastY)
				return this.switchState('down')
			
			if (this.top >= this.y)
				return this.switchState('fixed')
		},
		hidden_to_up: function ()
		{
			this.setTop(this.lastY - this.offsetHeight)
		},
		
		
		fixed: function ()
		{
			if (this.y > this.lastY)
				return this.switchState('down')
			
			if (this.y <= this.initialTop)
				return this.switchState('initial')
		},
		up_to_fixed: function ()
		{
			this.setTop(0)
			this.node.addClassName('fixed')
		}
	},
	
	switchState: function (name)
	{
		var transition = this.states[this.state.stateName + '_to_' + name]
		if (transition)
		{
			// log(this.state.stateName + ' -> ' + name)
			transition.call(this)
		}
		
		this.node.removeClassName('state-' + this.state.stateName)
		
		this.state = this.states[name]
		// log(this.state.stateName + '?')
		if (this.state() !== false)
		{
			// log(this.state.stateName + '!')
			this.node.addClassName('state-' + this.state.stateName)
		}
		return false
	},
	
	windowScrolled: function (y)
	{
		y -= this.topCompensation
		this.y = y
		// log(this.state.stateName + '?')
		if (this.state() !== false)
		{
			// log(this.state.stateName + '!')
		}
		this.lastY = y
	},
	
	hide: function (timeout)
	{
		this.windowScrolled(0)
	}
}

Me.className = 'FunFix'
self[Me.className] = Me

})();
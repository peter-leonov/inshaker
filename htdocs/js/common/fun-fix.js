;(function(){

function Me () {}

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
		
		var sm = this.sm = new StateMachine(this)
		sm.setStates(this.states)
		sm.onswitch = this.onswitch
	},
	
	setTop: function (top)
	{
		this.top = top
		this.style.top = top + 'px'
	},
	
	states:
	{
		initial: function (sm)
		{
			if (this.y > this.offsetHeight + this.initialTop)
				return sm.switchState('down')
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
		
		
		down: function (sm)
		{
			if (this.y < this.lastY)
				return sm.switchState('up')
			
			if (this.top + this.offsetHeight < this.y)
				return sm.switchState('hidden')
		},
		fixed_to_down: function ()
		{
			this.node.removeClassName('fixed')
			this.setTop(this.lastY)
		},
		
		
		hidden: function (sm)
		{
			if (this.y < this.lastY)
				return sm.switchState('up')
		},
		
		up: function (sm)
		{
			if (this.y <= this.initialTop)
				return sm.switchState('initial')
			
			if (this.y > this.lastY)
				return sm.switchState('down')
			
			if (this.top >= this.y)
				return sm.switchState('fixed')
		},
		hidden_to_up: function ()
		{
			this.setTop(this.lastY - this.offsetHeight)
		},
		
		
		fixed: function (sm)
		{
			if (this.y > this.lastY)
				return sm.switchState('down')
			
			if (this.y <= this.initialTop)
				return sm.switchState('initial')
		},
		up_to_fixed: function ()
		{
			this.setTop(0)
			this.node.addClassName('fixed')
		}
	},
	
	onswitch: function (from, to)
	{
		this.node.removeClassName('state-' + from)
		this.node.addClassName('state-' + to)
	},
	
	windowScrolled: function (y)
	{
		y -= this.topCompensation
		this.y = y
		// log(this.state.stateName + '?')
		this.sm.exec()
		
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
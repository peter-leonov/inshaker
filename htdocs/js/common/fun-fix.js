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
		
		var me = this
		sm.onswitch = function (from, to) { me.onswitch(from, to) }
	},
	
	setTop: function (top)
	{
		this.top = top
		this.style.top = top + 'px'
	},
	
	states:
	{
		initial:
		{
			enter: function ()
			{
				this.setTop(this.initialTop)
			},
			job: function (sm)
			{
				if (this.y > this.offsetHeight + this.initialTop)
					return sm.switchState('down')
			}
		},
		
		down:
		{
			enter_from_fixed: function ()
			{
				this.setTop(this.lastY)
			},
			job: function (sm)
			{
				if (this.y < this.lastY)
					return sm.switchState('up')
				
				if (this.top + this.offsetHeight < this.y)
					return sm.switchState('hidden')
			}
		},
		
		hidden:
		{
			job: function (sm)
			{
				if (this.y < this.lastY)
					return sm.switchState('up')
			}
		},
		
		up:
		{
			enter: function ()
			{
				this.setTop(this.lastY - this.offsetHeight)
			},
			job: function (sm)
			{
				if (this.y <= this.initialTop)
					return sm.switchState('initial')
				
				if (this.y > this.lastY)
					return sm.switchState('down')
				
				if (this.top >= this.y)
					return sm.switchState('fixed')
			}
		},
		
		fixed:
		{
			enter: function (sm)
			{
				this.setTop(0)
				this.node.classList.add('fixed')
			},
			job: function (sm)
			{
				if (this.y > this.lastY)
					return sm.switchState('down')
				
				if (this.y <= this.initialTop)
					return sm.switchState('initial')
			},
			leave: function ()
			{
				this.node.classList.remove('fixed')
			}
		}
	},
	
	onswitch: function (from, to)
	{
		this.node.classList.remove('state-' + from)
		this.node.classList.add('state-' + to)
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
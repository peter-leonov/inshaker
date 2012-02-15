;(function(){

function Me ()
{
	this.top = 0
	this.height = 0
	this.y = 0
	this.dy = 0
}

Me.prototype =
{
	bind: function (node)
	{
		this.node = node
		
		var pos = node.offsetPosition(document.documentElement)
		this.top = pos.top
		this.height = node.offsetHeight
	},
	
	windowScrolled: function (y)
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
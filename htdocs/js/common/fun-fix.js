;(function(){

function Me () {}

Me.prototype =
{
	bind: function (node)
	{
		this.node = node
		
		var pos = node.offsetPosition(document.documentElement)
		this.top = pos.top
		this.left = pos.left
	},
	
	windowScrolled: function (y)
	{
		var far = y > this.top
		
		var lastFar = this.lastFar
		
		// the most recent case
		if (far == lastFar)
			return
		
		var node = this.node
		
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
;(function(){

function Me () {}

Me.prototype =
{
	bind: function (node)
	{
		this.node = node
		
		this.top = node.offsetPosition(document.documentElement).top
	},
	
	windowScrolled: function (y)
	{
		var far = y > this.top
		
		var lastFar = this.lastFar
		
		// the most recent case
		if (far == lastFar)
			return
		
		this.lastFar = far
		
		if (!lastFar && far)
			this.node.addClassName('fixed')
		else if (lastFar && !far)
			this.node.removeClassName('fixed')
	}
}

Me.className = 'FunFix'
self[Me.className] = Me

})();
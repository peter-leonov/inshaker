;(function(){

function Me ()
{
	this.nodes = {}
}

eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		function keydown (e)
		{
			if (e.keyCode == 13)
			{
				this.blur()
				e.preventDefault()
			}
		}
		
		var allow = {8: 1, 33: 1, 34: 1, 37: 1, 38: 1, 39: 1, 40: 1, 46: 1, 48: 1, 49: 1, 50: 1, 51: 1, 52: 1, 53: 1, 54: 1, 55: 1, 56: 1, 57: 1}
		
		function keypress (e)
		{
			log(e.keyCode)
			
			if (e.keyCode == 13)
			{
				this.blur()
				e.preventDefault()
			}
			
			if (e.ctrlKey || e.metaKey)
				return
			
			if (allow[e.keyCode])
				return
			
			e.preventDefault()
		}
		
		// nodes.count.addEventListener('keydown', keydown, false)
		nodes.count.addEventListener('keypress', keypress, false)
		nodes.count.addEventListener('focus', function (e) { this.addClassName('focused') }, false)
		nodes.count.addEventListener('blur', function (e) { this.removeClassName('focused'); if (!this.firstChild || !this.firstChild.nodeValue) this.innerHTML = 0 }, false)
		
		return this
	}
}

Papa.View = Me

})();

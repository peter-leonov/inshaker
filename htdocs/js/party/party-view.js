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
		
		function keypress (e)
		{
			setTimeout(function () { nodes.body.firstChild.nodeValue = nodes.count.innerHTML }, 1)
			if (e.keyCode == 13)
			{
				nodes.count.blur()
				nodes.count.focus()
				nodes.count.blur()
				e.preventDefault()
			}
		}
		
		function blur (e)
		{
			this.removeClassName('focused')
			
			var v = (this.firstChild && this.firstChild.nodeValue) || ''
			
			v = parseInt(v.replace(/\D|^0+/g, ''))
			
			this.innerHTML = isNaN(v) ? 0 : v
		}
		
		// nodes.count.parentNode.addEventListener('click', function (e) { nodes.count.focus() }, false)
		document.addEventListener('keypress', keypress, false)
		nodes.count.addEventListener('focus', function (e) { this.addClassName('focused') }, false)
		nodes.count.addEventListener('blur', blur, false)
		
		
		return this
	}
}

Papa.View = Me

})();

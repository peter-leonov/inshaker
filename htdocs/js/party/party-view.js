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
		
		function getNumberValue (v)
		{
			// to string
			v = '' + v
			// clean up all non-digital chars
			v = v.replace(/[^0-9\-]+/g, '')
			// convert to number base 10
			v = parseInt(v, 10)
			// convert NaN to 0
			v = isNaN(v) ? 0 : v
			
			return v
		}
		
		function keypress (e)
		{
			setTimeout(function () { nodes.body.firstChild.nodeValue = getNumberValue(nodes.count.value) }, 1)
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
		}
		
		// listen at document level to fix Opera 9
		document.addEventListener('keypress', keypress, false)
		nodes.count.addEventListener('focus', function (e) { this.addClassName('focused') }, false)
		nodes.count.addEventListener('blur', blur, false)
		
		
		return this
	},
	
	guessParty: function ()
	{
		var name = this.nodes.partyName.getAttribute('data-value')
		this.controller.partyNameGuessed(name)
	}
}

Papa.View = Me

})();

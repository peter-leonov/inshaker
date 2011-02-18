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
		nodes.count.addEventListener('keypress', keypress, false)
		nodes.count.addEventListener('focus', function (e) { this.addClassName('focused') }, false)
		nodes.count.addEventListener('blur', blur, false)
		
		function fixEditable (e)
		{
			// var pairs = []
			// 
			// alert(e.srcElement)
			// 
			// for (var k in e)
			// 	// pairs.push(k + ' = ' + e.target[k])
			// 	pairs.push(k)
			// 
			// alert(pairs.join(', '))
			
			// if (e.srcElement.contentEditable)
			// 	alert(e.srcElement)
			
			if (e.__liby__fakeKeypressEventForContentEditable)
				return
			
			var target = e.srcElement
			
			if (!target.contentEditable)
				return
			
			var ne = document.createEvent('Event')
			ne.initEvent('keypress', true, true)

			// copying valueable data
			ne.altKey = e.altKey
			ne.ctrlKey = e.ctrlKey
			ne.metaKey = e.metaKey
			ne.charCode = e.charCode
			ne.keyCode = e.keyCode
			ne.__liby__fakeKeypressEventForContentEditable = true
			
			e.stopPropagation()
			
			if (!target.dispatchEvent(ne))
				e.preventDefault()
		}
		
		document.addEventListener('keypress', fixEditable, true)
		
		return this
	}
}

Papa.View = Me

})();

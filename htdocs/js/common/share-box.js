;(function(){

function Me () {}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		nodes.root.addEventListener('click', function (e) { me.clicked(e) }, false)
	},
	
	render: function (url, text)
	{
		var buttons = this.nodes.buttons
		
		var values = {url: encodeURIComponent(url), text: encodeURIComponent(text)}
		for (var i = 0, il = buttons.length; i < il; i++)
			buttons[i].href = buttons[i].href.interpolate(values)
	},
	
	clicked: function (e)
	{
		var href = this.searchParentNodes(this.nodes.root, e.target, function (node) { return node.href })
		if (!href)
			return
		
		e.preventDefault()
		this.openWindow(href)
	},
	
	openWindow: function (href)
	{
		var w = 550, h = 350, l = 0, t = 0,
			sh = window.screen.height,
			sw = window.screen.width
		
		if (sw < w)
			w = sw
		else
			l = Math.round((sw - w) / 2)
		
		if (sh < h)
			h = sh
		else
			t = Math.round((sh - h) / 2)
		
		window.open(href, '', 'left=' + l + ',top=' + t + ',width=' + w + ',height=' + h + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1')
	},
	
	searchParentNodes: function (root, node, f)
	{
		for (;;)
		{
			if (!node)
				break
			
			var v = f(node)
			if (v !== undefined)
				return v
			
			if (node == root)
				break
			
			node = node.parentNode
		}
	}
}

Me.className = 'ShareBox'
self[Me.className] = Me

})();

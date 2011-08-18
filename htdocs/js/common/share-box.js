;(function(){

function Me () {}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
	},
	
	render: function (url, title)
	{
		url = encodeURIComponent(url)
		
		var buttons = this.nodes.buttons
		for (var i = 0, il = buttons.length; i < il; i++)
			buttons[i].href = buttons[i].href.replace('${link}', url)
		
	
	openWindow: function (href)
	{
		var w = 550, h = 312, l = 0, t = 0,
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
	
	}
}

Me.className = 'ShareBox'
self[Me.className] = Me

})();

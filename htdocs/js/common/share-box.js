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
		
	}
}

Me.className = 'ShareBox'
self[Me.className] = Me

})();

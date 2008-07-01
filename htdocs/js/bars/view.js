var BarsView =
{
	cache: {},
	
	initialize: function (nodes)
	{
		this.nodes = nodes
	},
	
	modelChanged: function (data)
	{
		this.renderBars(data)
	},
	
	renderBars: function (bars)
	{
		var parent = this.nodes.barsContainer
		for (var i = 0; i < bars.length; i++)
		{
			var bar = bars[i]
			var node = this.getBarNode(bar)
			parent.appendChild(node)
			parent.appendChild(document.createTextNode(' '))
		}
	},
	
	getBarNode: function (bar)
	{
		var main = this.createBarNode(bar)
		main.setName(bar.name)
		main.setImage('/i/bar/pre/'+bar.id+'.jpg')
		main.setHref('/bars/'+bar.id+'.html')
		return main
	},
	
	createBarNode: function (bar)
	{
		var main = document.createElement('div')
		var name = document.createElement('a')
		main.appendChild(name)
		
		main.className = 'bar-mini'
		// main.data = {name:name}
		main.setImage = function (src) { main.style.backgroundImage = 'url('+src+')' }
		main.setName = function (text) { name.innerHTML = text }
		main.setHref = function (href) { name.href = href }
		return main
	}
}

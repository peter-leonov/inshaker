var BarsView =
{
	cache: {},
	
	initialize: function (nodes)
	{
		this.nodes = nodes
		nodes.citySelect.onselect	= function (val) { BarsController.citySelected(val) }
		nodes.formatSelect.onselect = function (val) { BarsController.formatSelected(val) }
		nodes.feelSelect.onselect	= function (val) { BarsController.feelSelected(val) }
	},
	
	modelChanged: function (data)
	{
		this.renderBars(data)
	},
	
	renderCities: function (options)
	{
		var node = this.nodes.citySelect
		node.setOptions(options)
		node.select(0, true)
	},
	
	renderFormats: function (options)
	{
		var node = this.nodes.formatSelect
		node.setOptions(options)
		node.select(0, true)
	},
	
	renderFeels: function (options)
	{
		var node = this.nodes.feelSelect
		node.setOptions(options)
		node.select(0, true)
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

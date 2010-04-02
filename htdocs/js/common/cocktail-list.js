;(function(){

function Me ()
{
	this.list = new LazyList()
	this.nodes = {}
	this.conf = {pageLength: 1}
	this.previewsCache = {}
	this.constructor = Me
	this.data = {cocktails:[]}
}

Me.className = 'CocktailList'

Me.prototype =
{
	configure: function (conf)
	{
		this.conf = conf
		this.list.configure(conf)
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var list = this.list
		list.bind(nodes)
		list.load = function (nodes)
		{
			for (var i = 0, il = nodes.length; i < il; i++)
			{
				var node = nodes[i],
					image = node.img
				
				image.src = image.lazySrc
				node.removeClassName('lazy')
			}
		}
		
		return this
	},
	
	setCocktails: function (cocktails)
	{
		this.data.cocktails = cocktails
		this.render()
	},
	
	getCocktailPreviewNode: function (cocktail)
	{
		var name = cocktail.name,
			previewsCache = this.previewsCache
		
		var preview = previewsCache[name]
		if (!preview)
			preview = previewsCache[name] = cocktail.getPreviewNode(true)
		
		return preview
	},
	
	render: function ()
	{
		
		var nodes = this.nodes, root = nodes.root, surface = nodes.surface, viewport = nodes.viewport,
			cocktails = this.data.cocktails
		
		surface.empty()
		
		var nodes = []
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var preview = this.getCocktailPreviewNode(cocktails[i])
			surface.appendChild(preview)
			nodes.push(preview)
		}
		
		var page = this.conf.pageLength
		if (cocktails.length >= page)
		{
			for (var j = 0; j < page; j++)
			{
				// we can't use getCocktailPreviewNode() here
				// because it returns the same node in every call
				// but we need a copy
				var preview = cocktails[j].getPreviewNode()
				surface.appendChild(preview)
			}
		}
		
		this.list.setNodes(nodes, cocktails.length)
	}
}

self[Me.className] = Me

})();
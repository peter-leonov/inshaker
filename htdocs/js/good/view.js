;(function(){

var Papa = GoodPage, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	previewsPageLength: 4,
	
	initialize: function ()
	{
		this.nodes = {}
		this.cache = {previews: {}, previewsGhosts: {}}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		this.controller.selectGoodByName(this.nodes.name.firstChild.nodeValue)
	},
	
	renderPreviews: function (goods)
	{
		var previews = this.nodes.previews, surface = previews.surface, viewport = previews.viewport
		
		surface.empty()
		
		var previewsCache = this.cache.previews,
			nodes = []
		for (var i = 0; i < goods.length; i++)
		{
			var good = goods[i]
			
			var item = Nc('li', 'item')
			surface.appendChild(item)
			
			var preview = good.getPreviewNode(true)
			item.appendChild(preview)
			
			item.appendChild(Nc('div', 'mark'))
			
			previewsCache[good.name] = item
			nodes.push(item)
		}
		
		var page = this.previewsPageLength,
			previewsGhostsCache = this.cache.previewsGhosts
		if (goods.length >= page)
		{
			for (var j = 0; j < page; j++)
			{
				var good = goods[j]
				
				var item = Nc('li', 'item')
				surface.appendChild(item)
				
				var preview = good.getPreviewNode(true)
				item.appendChild(preview)
				
				item.appendChild(Nc('div', 'mark'))
				
				previewsGhostsCache[good.name] = item
				nodes.push(item)
			}
		}
		
		
		var list = new LazyList()
		list.bind(previews)
		list.configure({pageLength: 4, pageVelocity: 42})
		list.load = function (nodes)
		{
			for (var i = 0, il = nodes.length; i < il; i++)
			{
				nodes[i].firstChild.lazyLoad()
			}
		}
		list.setNodes(nodes, goods.length)
	},
	
	selectGoodPreview: function (good)
	{
		var item = this.cache.previews[good.name]
		if (item)
			item.addClassName('selected')
		
		var item = this.cache.previewsGhosts[good.name]
		if (item)
			item.addClassName('selected')
	}
}

Object.extend(Me.prototype, myProto)

})();

;(function(){

var Papa = GoodPage, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	previewsPageLength: 4,
	promosPageLength: 1,
	
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
	
	selectGood: function (good)
	{
		this.selectGoodPreview(good)
		this.renderPromos(good)
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
			for (var i = 0; i < page; i++)
			{
				var good = goods[i]
				
				var item = Nc('li', 'item')
				surface.appendChild(item)
				
				var preview = good.getPreviewNode()
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
	
	renderPromos: function (good)
	{
		var promos = this.nodes.promos, surface = promos.surface, viewport = promos.viewport
		
		surface.empty()
		
		var nodes = []
		for (var i = 0, il = good.promos; i < il; i++)
		{
			var promo = good.getPromoNode(i, true)
			surface.appendChild(promo)
			nodes.push(promo)
		}
		
		var page = this.promosPageLength
		if (good.promos >= page)
		{
			for (var i = 0; i < page; i++)
			{
				var promo = good.getPromoNode(i)
				surface.appendChild(promo)
				nodes.push(promo)
			}
		}
		
		var list = new LazyList()
		list.bind(promos)
		list.configure({pageLength: 1, friction: 100, pageVelocity: 43, soft: 100, min: 25})
		list.load = function (nodes)
		{
			for (var i = 0, il = nodes.length; i < il; i++)
			{
				nodes[i].lazyLoad()
			}
		}
		list.setNodes(nodes, good.promos)
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

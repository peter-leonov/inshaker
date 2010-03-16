;(function(){

var Papa = GoodPage, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
		this.cache = {}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		this.controller.selectGoodByName(this.nodes.name.firstChild.nodeValue)
	},
	
	renderPreviews: function (goods)
	{
		var root = this.nodes.previewsSurface
		root.empty()
		
		var previewsCache = this.cache.previews = {}
		for (var i = 0; i < goods.length; i++)
		{
			var good = goods[i]
			
			var item = Nc('li', 'item')
			root.appendChild(item)
			
			item.appendChild(Nc('div', 'mark'))
			
			var preview = good.getPreviewNode()
			item.appendChild(preview)
			
			previewsCache[good.name] = item
		}
	},
	
	selectGoodPreview: function (good)
	{
		var previewsCache = this.cache.previews
		if (previewsCache)
		{
			var item = previewsCache[good.name]
			if (item)
				item.addClassName('selected')
		}
	}
}

Object.extend(Me.prototype, myProto)

})();

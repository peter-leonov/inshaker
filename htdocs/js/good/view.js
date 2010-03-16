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
			
			var item = N('li')
			root.appendChild(item)
			
			var preview = previewsCache[good.name] = good.getPreviewNode()
			item.appendChild(preview)
		}
	},
	
	selectGoodPreview: function (good)
	{
		var previewsCache = this.cache.previews
		if (previewsCache)
		{
			var preview = previewsCache[good.name]
			if (preview)
				preview.addClassName('selected')
		}
	}
}

Object.extend(Me.prototype, myProto)

})();

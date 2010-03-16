;(function(){

var Papa = GoodPage, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
	},
	
	modelChanged: function (data)
	{
		var root = this.nodes.previewsSurface
		
		root.empty()
		
		for (var i = 0; i < data.length; i++)
		{
			var item = N('li')
			var preview = data[i].getPreviewNode()
			item.appendChild(preview)
			root.appendChild(item)
		}
		
		preview.addClassName('selected')
	}
}

Object.extend(Me.prototype, myProto)

})();

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
		for (var i = 0; i < data.length; i++)
			this.nodes.previewsSurface.appendChild(T(data[i].name))
		
	}
}

Object.extend(Me.prototype, myProto)

})();

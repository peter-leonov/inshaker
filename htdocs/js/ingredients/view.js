;(function(){

var Papa = IngredientsPage, Me = Papa.View

eval(NodesShortcut())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		
		
		return this
	},
	
	modelChanged: function (data)
	{
		var output = this.nodes.output
		output.empty()
		for (var i = 0; i < data.length; i++)
		{
			var group = this.renderGroup(data[i])
			output.appendChild(group)
		}
	},
	
	renderGroup: function (group)
	{
		var root = N('dl', 'group')
		
		var head = N('dt', 'head', group.name)
		root.appendChild(head)
		
		
		var body = N('dt', 'body')
		root.appendChild(body)
		
		var list = N('ul', 'list')
		var ingreds = group.list
		for (var i = 0; i < ingreds.length; i++)
		{
			var item = N('li', 'item')
			item.appendChild(this.getIngredientNode(ingreds[i]))
			list.appendChild(item)
		}
		body.appendChild(list)
		
		return root
	},
	
	getIngredientNode: function (ingred)
	{
		var node = N('a', 'ingredient')
		var image = N('img', 'image');
		// image.title = ingred.name
		image.src = ingred.getMiniImageSrc()
		node.appendChild(image)
		return node
	}
}

Object.extend(Me.prototype, myProto)

})();

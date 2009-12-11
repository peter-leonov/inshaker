;(function(){

var Papa = IngredientsPage, Me = Papa.View

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
		
		
		
		return this
	},
	
	modelChanged: function (data)
	{
		var output = this.nodes.output
		output.empty()
		// console.time('render')
		for (var i = 0; i < data.length; i++)
		{
			var group = this.renderGroup(data[i])
			output.appendChild(group)
		}
		// console.timeEnd('render')
	},
	
	renderGroup: function (group)
	{
		var root = Nc('dl', 'group')
		
		var head = Nct('dt', 'head', group.name)
		root.appendChild(head)
		
		var body = Nc('dt', 'body')
		root.appendChild(body)
		
		var list = Nc('ul', 'list')
		var ingreds = group.list
		for (var i = 0; i < ingreds.length; i++)
		{
			var item = Nc('li', 'item')
			item.appendChild(this.getIngredientNode(ingreds[i]))
			list.appendChild(item)
		}
		body.appendChild(list)
		
		return root
	},
	
	getIngredientNode: function (ingred)
	{
		var node = Nc('a', 'ingredient')
		node.href = '/cocktails.html#state=byIngredients&ingredients=' + encodeURIComponent(ingred.name)
		var image = Nc('img', 'image')
		// image.title = ingred.name
		image.src = ingred.getMiniImageSrc()
		node.appendChild(image)
		return node
	}
}

Object.extend(Me.prototype, myProto)

})();

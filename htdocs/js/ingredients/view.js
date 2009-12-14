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
		
		var controller = this.controller
		
		var groupBy = this.groupBySwitcher = new TabSwitcher()
		groupBy.bind({tabs: nodes.groupByItems, sections:[]})
		groupBy.addEventListener('select', function (e) { e.preventDefault(); controller.groupBySelected(e.data.value) }, false)
		
		var sortBy = this.sortBySwitcher = new TabSwitcher()
		sortBy.bind({tabs: nodes.sortByItems, sections:[]})
		sortBy.addEventListener('select', function (e) { e.preventDefault(); controller.sortBySelected(e.data.value) }, false)
		
		var drawBy = this.drawBySwitcher = new TabSwitcher()
		drawBy.bind({tabs: nodes.drawByItems, sections:[]})
		drawBy.addEventListener('select', function (e) { e.preventDefault(); controller.drawBySelected(e.data.value) }, false)
		
		return this
	},
	
	listChanged: function (data)
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
	
	groupByChanged: function (type)
	{
		this.groupBySwitcher.renderSelected(type)
	},
	
	sortByChanged: function (type)
	{
		this.sortBySwitcher.renderSelected(type)
	},
	
	drawByChanged: function (type)
	{
		var output = this.nodes.output,
			names = this.drawBySwitcher.getNames()
		for (var i = 0; i < names.length; i++)
			output.toggleClassName(names[i], names[i] === type)
		
		this.drawBySwitcher.renderSelected(type)
	},
	
	renderGroup: function (group)
	{
		var root = Nc('dl', 'group')
		
		if ('name' in group)
			root.appendChild(Nct('dt', 'head', group.name))
		
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
		
		var name = Nct('span', 'name', ingred.name)
		node.appendChild(name)
		
		return node
	}
}

Object.extend(Me.prototype, myProto)

})();

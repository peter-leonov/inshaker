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
		
		var me = this
		nodes.output.addEventListener('click', function (e) { me.mayBeIngredintClicked(e.target) }, false)
		
		return this
	},
	
	mayBeIngredintClicked: function (target)
	{
		var output = this.nodes.output, ingredient
		
		for (var node = target; node != output; node = node.parentNode)
			if (node.ingredient)
			{
				ingredient = node.ingredient
				break
			}
		
		if (ingredient)
			this.controller.ingredientSelected(ingredient)
	},
	
	showIngredient: function (ingredient)
	{
		var nodes = this.nodes.ingredientPopup
		var popup = new Popup()
		popup.bind({root: nodes.root, window: nodes.window, front: nodes.front})
		
		var name = nodes.name
		name.empty()
		name.appendChild(T(ingredient.name))
		
		nodes.text.innerHTML = ingredient.desc
		
		nodes.image.src = ingredient.getMainImageSrc()
		
		popup.show()
		
		var me = this
		setTimeout(function () { me.renderCocktails(nodes.cocktailsViewport, nodes.cocktailsSurface, ingredient.cocktails) }, 50)
	},
	
	renderCocktails: function (viewport, surface, cocktails, onPage)
	{
		if (!onPage)
			onPage = 5
		surface.empty()
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var preview = cocktails[i].getPreviewNode()
			surface.appendChild(preview)
		}
		
		if (cocktails.length >= onPage)
		{
			for (var j = 0; j < onPage; j++)
			{
				var preview = cocktails[j].getPreviewNode()
				surface.appendChild(preview)
			}
			var is = new InfiniteScroller().bind(viewport, preview.clientWidth * i, preview.clientWidth)
		}
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
	
	getIngredientNode: function (ingredient)
	{
		var node = Nc('a', 'ingredient')
		// node.href = '/cocktails.html#state=byIngredients&ingredients=' + encodeURIComponent(ingredient.name)
		var image = Nc('img', 'image')
		// image.title = ingredient.name
		image.src = ingredient.getMiniImageSrc()
		node.appendChild(image)
		
		var name = Nct('span', 'name', ingredient.name)
		node.appendChild(name)
		
		node.ingredient = ingredient
		
		return node
	}
}

Object.extend(Me.prototype, myProto)

})();

;(function(){

var Papa = IngredientsPage, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
		this.popupCache = {}
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
		
		var popupCloner = this.popupCloner = new Cloner()
		popupCloner.bind(this.nodes.ingredientPopupRoot, this.nodes.ingredientPopup)
		
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
		var popup = this.popupCache[ingredient.name]
		
		if (popup)
			return popup.show()
		
		var popupClone = this.popupCloner.create()
		document.body.appendChild(popupClone.root)
		
		var nodes = popupClone.nodes
		var popup = new Popup()
		this.popupCache[ingredient.name] = popup
		popup.bind({root: popupClone.root, window: nodes.window, front: nodes.front})
		
		var name = ingredient.brand || ingredient.name
		nodes.name.appendChild(T(name))
		
		var len = ingredient.cocktails.length
		if (len)
			nodes.allLink.appendChild(T(' ' + len + ' ' +len.plural('коктейль', 'коктейля', 'коктейлей')))
		
		if (ingredient.decls)
			nodes.allLink.appendChild(T(' ' + ingredient.decls.t))
		nodes.allLink.href = ingredient.cocktailsLink()
		
		nodes.text.innerHTML = ingredient.desc
		
		nodes.image.src = ingredient.getMainImageSrc()
		
		var me = this
		setTimeout(function () { me.renderCocktails(nodes, ingredient.cocktails) }, 50)
		
		return popup.show()
	},
	
	renderCocktails: function (popupNodes, cocktails)
	{
		cocktails = cocktails.slice().randomize()
		
		var cl = new CocktailList()
		var nodes =
		{
			root: popupNodes.cocktails,
			viewport: popupNodes.cocktailsViewport,
			surface: popupNodes.cocktailsSurface,
			prev: popupNodes.cocktailsPrev,
			next: popupNodes.cocktailsNext
		}
		cl.bind(nodes, cocktails, 5)
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

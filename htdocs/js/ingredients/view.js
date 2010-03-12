;(function(){

var Papa = IngredientsPage, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
		this.popupCache = {}
		this.ingredientCache = {}
		this.itemCache = [] // just a plain list
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
		popup.show()
		
		var brand = ingredient.brand
		if (brand)
		{
			nodes.mark.appendChild(T(ingredient.brand))
			nodes.ingredientWindow.addClassName('branded')
			nodes.brand.appendChild(T(ingredient.mark))
			nodes.brand.href = Ingredient.ingredientsLinkByMark(ingredient.mark)
		}
		
		nodes.name.appendChild(T(ingredient.name))
		
		var len = ingredient.cocktails.length
		if (len)
			nodes.allLink.appendChild(T(' ' + len + ' ' + len.plural('коктейль', 'коктейля', 'коктейлей')))
		
		if (ingredient.decls)
			nodes.allLink.appendChild(T(' ' + ingredient.decls.t))
		nodes.allLink.href = ingredient.cocktailsLink()
		
		nodes.text.innerHTML = ingredient.desc
		
		nodes.image.src = ingredient.getMainImageSrc()
		
		var me = this
		setTimeout(function () { me.renderCocktails(nodes, ingredient.cocktails) }, 0)
		
		Statistics.ingredientPopupOpened(ingredient)
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
		cl.bind(nodes)
		cl.pageLength = 5
		cl.pageVelocity = 38
		cl.setCocktails(cocktails)
	},
	
	listChanged: function (data)
	{
		var output = this.nodes.output
		output.empty()
		
		this.itemCache = []
		
		// console.time('render')
		for (var i = 0; i < data.length; i++)
		{
			var group = this.renderGroup(data[i])
			output.appendChild(group)
		}
		// console.timeEnd('render')
		
		this.setupVisibilityFrame(this.itemCache)
	},
	
	setupVisibilityFrame: function (nodes)
	{
		var begin = new Date()
		
		if (!nodes.length)
			return
		
		var node = nodes[0]
		
		var width = node.offsetWidth,
			height = node.offsetHeight
		
		var lastParent, position, boxes = []
		for (var i = 0, il = nodes.length; i < il; i++)
		{
			var node = nodes[i],
				parent = node.offsetParent
			
			if (parent !== lastParent)
			{
				lastParent = parent
				position = parent.offsetPosition()
			}
			
			var left = node.offsetLeft + position.left,
				top = node.offsetTop + position.top
			
			boxes[i] =
			{
				x: left,
				y: top,
				w: width,
				h: height,
				node: node
			}
		}
		
		var frame = new VisibilityFrame()
		frame.setFrame(4000, 1500) // hardcoded for now
		frame.setStep(500, 500)
		frame.setBoxes(boxes)
		
		frame.onmove = function (show, hide)
		{
			for (var i = 0; i < show.length; i++)
			{
				var box = show[i]
				if (!box.loaded)
				{
					var node = box.node,
						image = node.ingredientNode.ingredientImage
					
					image.src = image.lazySrc
					node.removeClassName('lazy')
					
					box.loaded = true
				}
			}
		}
		
		function onscroll ()
		{
			frame.moveTo(window.pageXOffset, window.pageYOffset)
		}
		var timer
		window.addEventListener('scroll', function () { clearTimeout(timer); timer = setTimeout(onscroll, 200) }, false)
		onscroll()
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
		var ingreds = group.list, itemCache = this.itemCache
		for (var i = 0; i < ingreds.length; i++)
		{
			var item = Nc('li', 'item lazy')
			itemCache.push(item)
			var ingredientNode = this.getIngredientNode(ingreds[i])
			item.appendChild(ingredientNode)
			item.ingredientNode = ingredientNode
			list.appendChild(item)
		}
		body.appendChild(list)
		
		return root
	},
	
	getIngredientNode: function (ingredient)
	{
		if ((node = this.ingredientCache[ingredient.name]))
			return node
		
		var node = Nc('a', 'ingredient')
		var image = Nc('img', 'image')
		image.lazySrc = ingredient.getMiniImageSrc()
		node.appendChild(image)
		
		var name = Nct('span', 'name', ingredient.name)
		node.appendChild(name)
		
		node.ingredient = ingredient
		node.ingredientImage = image
		
		return this.ingredientCache[ingredient.name] = node
	}
}

Object.extend(Me.prototype, myProto)

})();

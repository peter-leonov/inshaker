;(function(){

function Me ()
{
	this.nodes = {}
	this.planStack = []
}

eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		this.frames =
		{
			'rating-total': nodes.ratingTotal,
			'rating-ingredient': nodes.ratingIngredient,
			'rating-tag': nodes.ratingTag
		}
		
		var view = this
		nodes.widget.addEventListener('click', function(e){ view.maybeIngredientClicked(e.target) }, false)
		
		var lh = this.locationHash = new LocationHash().bind()
		lh.addEventListener('change', function (e) { view.hashChanged() }, false)
	},
	
	hashChanged: function ()
	{
		this.controller.changeHashReaction(this.locationHash.get())
	},
	
	maybeIngredientClicked: function (target)
	{
		var ingredient = target['data-ingredient']
		if (!ingredient)
			return
		
		IngredientPopup.show(ingredient)
	},
	
	renderTotal: function (cocktails)
	{
		var ratingTotal = this.nodes.ratingTotal
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			
			var li = N('li')
			
			var cocktailPos = Nc('div', 'cocktail-position')
			cocktailPos.appendChild( Nc('span', 'arrow ' + (cocktail.totalDirection < 0 ? 'down' : 'up')) )
			cocktailPos.appendChild( T(i+1) )
			li.appendChild(cocktailPos)
			
			var cocktailImage = Nc('div', 'cocktail-image')
			li.appendChild(cocktailImage)
			
			var img = cocktail.getLinkImage(false, false)
			cocktailImage.appendChild(img)
			
			var ingredients = Nc('div', 'cocktail')
			li.appendChild(ingredients)
			
			var h3 = N('h3')
			ingredients.appendChild(h3)
			
			var a = Nct('a', 'cocktail-name', cocktail.name)
			a.href = cocktail.getPath()
			h3.appendChild(a)
			
			ingredients.appendChild(this.renderIngredientLinks(cocktail.ingredients))
			ratingTotal.appendChild(li)
		}
	},
	
	calculateEllipses: function (nodes)
	{
		var bigs = []
		
		var total = 0, small = 0
		for (var i = 0, il = nodes.length; i < il; i++)
		{
			var node = nodes[i]
			
			if (node.scrollHeight > node.offsetHeight)
			{
				bigs.push(node)
				continue
			}
			
			total += node.childNodes.length
			small++
		}
		
		var medium = Math.round(total / small)
		
		for (var i = 0, il = bigs.length; i < il; i++)
		{
			var big = bigs[i]
			
			big.classList.add('overflowed')
			
			var childs = big.childNodes.length
			while (childs-- > medium)
				big.removeChild(big.lastChild)
		}
	},
	
	planToRender: function (node)
	{
		this.planStack.push(node)
		
		if (this.planTimer)
			return
		
		var view = this
		function plan ()
		{
			view.planTimer = 0
			
			var stack = view.planStack
			// console.time('plan')
			view.calculateEllipses(stack)
			// console.timeEnd('plan')
			
			stack.length = 0
		}
		this.planTimer = setTimeout(plan, 0)
	},
	
	renderIngredientLinks: function (ingredients)
	{
		var links = Nc('div', 'ingredients-list')
		
		for (var j = 0, jl = ingredients.length; j < jl; j++)
		{
			var ing = ingredients[j]
			var ingObj = Ingredient.getByName(ing[0])
			
			var name = ingObj.screenName()
			
			var mark = ingObj.mark
			if (mark)
				name += ' ' + mark
			
			var a = Nct('a', 'cocktail-ingredient', name)
			a['data-ingredient'] = ingObj
			links.appendChild(a)
		}
		
		this.planToRender(links)
		
		return links
	},
	
	renderCol: function (cocktailsObj, root)
	{
		for (var i = 0, il = cocktailsObj.length; i < il; i++)
		{
			var group = cocktailsObj[i]
			
			var col = Nc('div', 'rating-col')
			root.appendChild(col)
			
			var h2 = Nct('h2', 'rating-name', group.name)
			col.appendChild(h2)
			
			var count = Nct('span', 'count', 'Топ ' + group.cocktails.length + ' из ' + group.count)
			h2.appendChild(count)
			
			var list = Nc('ul', 'rating-list')
			col.appendChild(list)
			
			
			var firstCocktail = group.cocktails[0]
			
			var firstItem = Nc('li', 'first-item')
			list.appendChild(firstItem)
			
			firstItem.appendChild(firstCocktail.cocktail.getLinkImage(false, true))
			
			var h3 = N('h3')
			firstItem.appendChild(h3)
			
			var link = Nct('a', 'cocktail-name', firstCocktail.cocktail.name)
			link.href = firstCocktail.cocktail.getPath()
			h3.appendChild(link)
			
			var position = Nc('div', 'cocktail-position')
			firstItem.appendChild(position)
			
			var positionArrow = Nc('span', 'arrow ' + (firstCocktail.specialDirection < 0 ? 'down' : 'up'))
			position.appendChild(positionArrow)
			position.appendChild(T('1-ая позиция в текущем рейтинге'))
			
			var ingredients = Nc('div', 'cocktail')
			firstItem.appendChild(ingredients)
			ingredients.appendChild(this.renderIngredientLinks(firstCocktail.cocktail.ingredients))
			
			var rating = Nct('div', 'cocktail-rating', firstCocktail.totalPos)
			firstItem.appendChild(rating)
				
			var ratingArrow = Nc('span', 'arrow ' + (firstCocktail.totalDirection < 0 ? 'down' : 'up'))
			rating.appendChild(ratingArrow)
			
			var note = Nct('span', 'note', 'позиция в рейтинге всех коктейлей')
			rating.appendChild(note)
			
			
			for (var j = 1, jl = group.cocktails.length; j < jl; j++)
			{
				var cocktail = group.cocktails[j]
				
				var item = Nc('li', 'item')
				list.appendChild(item)
				
				var position = Nct('div', 'cocktail-position', j+1)
				item.appendChild(position)
				
				var positionArrow = Nc('span', 'arrow ' + (cocktail.specialDirection < 0 ? 'down' : 'up'))
				position.appendChild(positionArrow)
				
				var ingredients = Nc('div', 'cocktail')
				item.appendChild(ingredients)
				
				var h3 = N('h3')
				ingredients.appendChild(h3)
				
				var link = Nct('a', 'cocktail-name', cocktail.cocktail.name)
				link.href = cocktail.cocktail.getPath()
				h3.appendChild(link)
				
				ingredients.appendChild(this.renderIngredientLinks(cocktail.cocktail.ingredients))
				
				
				var rating = Nct('div', 'cocktail-rating', cocktail.totalPos)
				item.appendChild(rating)
				
				var ratingArrow = Nc('span', 'arrow ' + (cocktail.totalDirection < 0 ? 'down' : 'up'))
				rating.appendChild(ratingArrow)
			}
		}
	},
	
	renderRatingByIngredient: function (set)
	{
		this.renderCol(set, this.nodes.ratingIngredient)
	},
	
	renderRatingByTag: function (set)
	{
		this.renderCol(set, this.nodes.ratingTag)
	},
	
	switchToFrame: function (frame)
	{
		var lastFrame = this.lastFrame
		if (frame == lastFrame)
			return
		this.lastFrame = frame
		
		var widgetCL = this.nodes.widget.classList
		widgetCL.remove('state-' + lastFrame)
		widgetCL.add('state-' + frame)
		
		if (lastFrame)
			this.frames[lastFrame].hide()
		this.frames[frame].show()
	}
}

Papa.View = Me

})();

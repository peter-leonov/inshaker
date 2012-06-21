;(function(){

function Me ()
{
	this.nodes = {}
	this.lastFrame = 'rating-total'
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
		
		var lh = new LocationHash().bind()
		var controller = this.controller
		lh.addEventListener('change', function (e) { controller.changeHashReaction(lh.get()) }, false)
		controller.changeHashReaction(lh.get())
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
		var ratingTotal = this.frames['rating-total']
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i],
				li = N('li')
			
			var cocktailPos = Nc('div', 'cocktail-position'),
				arrowClass = '',
				arrowNum = cocktail.totalDirection
			
			if (arrowNum)
			{
				if (arrowNum > 0)
					arrowClass = 'arrow up'
				else if (arrowNum < 0)
					arrowClass = 'arrow down'
			}
			
			cocktailPos.appendChild( Nc('span', arrowClass) )
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
	
	renderIngredientLinks: function (ingredients)
	{
		var links = Nc('div', 'ingredients-list')
		
		function feed ()
		{
			for (var j = 0, jl = ingredients.length; j < jl; j++)
			{
				var ing = ingredients[j]
				var ingObj = Ingredient.getByName(ing[0])
				
				var name = ingObj.screenName()
				
				var brand = ingObj.brand
				if (brand)
					name += ' ' + brand
				
				var a = Nct('a', 'cocktail-ingredient', name)
				a['data-ingredient'] = ingObj
				links.appendChild(a)
				
				if (links.scrollHeight > links.offsetHeight)
				{
					links.removeChild(a)
					links.classList.add('overflowed')
					break
				}
				
				links.appendChild(T(' '))
			}
		}
		
		window.setTimeout(feed, 0)
		
		return links
	},
	
	renderCol: function (cocktailsObj, frame)
	{
		var ratingNode = this.frames[frame]
		
		for (var i = 0, il = cocktailsObj.length; i < il; i++)
		{
			var group = cocktailsObj[i]
			
			var col = Nc('div', 'rating-col')
			ratingNode.appendChild(col)
			
			var h2 = Nct('h2', 'rating-name', group.name)
			col.appendChild(h2)
			
			var count = Nct('span', 'count', group.cocktails.length + ' из ' + group.count)
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
			
			var arrowClass = '',
				arrowNum = firstCocktail.specialDirection
			
			if (arrowNum)
			{
				if (arrowNum > 0)
					arrowClass = 'arrow up'
				else if (arrowNum < 0)
					arrowClass = 'arrow down'
			}
			
			var positionArrow = Nc('span', arrowClass)
			position.appendChild(positionArrow)
			position.appendChild(T('1-ая позиция в текущем рейтинге'))
			
			var ingredients = Nc('div', 'cocktail')
			firstItem.appendChild(ingredients)
			ingredients.appendChild(this.renderIngredientLinks(firstCocktail.cocktail.ingredients))
			
			var rating = Nct('div', 'cocktail-rating', firstCocktail.totalPos)
			firstItem.appendChild(rating)
				
			var arrowClassTotal = '',
				arrowNumTotal = firstCocktail.totalDirection
				
			if (arrowNumTotal)
			{
				if (arrowNumTotal > 0)
					arrowClassTotal = 'arrow up'
				else if (arrowNumTotal < 0)
					arrowClassTotal = 'arrow down'
			}
			
			var ratingArrow = Nc('span', arrowClassTotal)
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
				
				var arrowClass = '',
					arrowNum = cocktail.specialDirection
				
				if (arrowNum)
				{
					if (arrowNum > 0)
						arrowClass = 'arrow up'
					else if (arrowNum < 0)
						arrowClass = 'arrow down'
				}
				
				var positionArrow = Nc('span', arrowClass)
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
				
				var arrowClassTotal = '',
					arrowNumTotal = cocktail.totalDirection
				
				if (arrowNumTotal)
				{
					if (arrowNumTotal > 0)
						arrowClassTotal = 'arrow up'
					else if (arrowNumTotal < 0)
						arrowClassTotal = 'arrow down'
				}
				
				var ratingArrow = Nc('span', arrowClassTotal)
				rating.appendChild(ratingArrow)
			}
		}
	},
	
	renderRatingByIngredient: function (set)
	{
		this.renderCol(set, 'rating-ingredient')
	},
	
	renderRatingByTag: function (set)
	{
		this.renderCol(set, 'rating-tag')
	},
	
	switchToFrame: function (frame)
	{
		if (frame == this.lastFrame)
			return
		
		var last = this.frames[this.lastFrame],
			current = this.frames[frame]
		
		current.show()
		last.hide()
		
		this.lastFrame = frame
	}
}

Papa.View = Me

})();

;(function(){

function Me ()
{
	this.nodes = {}
}

eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		this.controller.temp()
		
		var view = this
		nodes.mainWrapper.addEventListener('click', function(e){ view.maybeIngredientClicked(e.target) }, false)
	},
	
	maybeIngredientClicked : function(target)
	{
		if(!target.parentNode)
			return
		
		var ingredient = target['data-ingredient']
		if(ingredient)
		{
			this.controller.ingredientSelected(ingredient)
		}
	},
	
	showIngredient: function (ingredient)
	{
		if (ingredient)
		{
			var popup = IngredientPopup.show(ingredient)
			var controller = this.controller
			popup.onhide = function () { controller.ingredientSelected(null) }
		}
		else
		{
			IngredientPopup.hide()
		}
	},
	
	renderTotal: function(cocktails)
	{
		var ratingTotal = this.nodes.ratingTotal
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i],
				li = N('li')
			
			var cocktailPos = Nc('div', 'cocktail-position'),
				arrowClass = ''
			
			if (cocktail.totalArrow)
				arrowClass += 'arrow ' + cocktail.totalArrow
			
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
	
	renderIngredientLinks: function(ingredients)
	{
		var links = document.createDocumentFragment()
		
		for (var j = 0, jl = ingredients.length; j < jl; j++) 
		{
			var ing = ingredients[j]
			var ingObj = Ingredient.getByName(ing[0])
			
			var name = ing[0]
			
			var brand = ingObj.brand
			if (brand)
				name += ' ' + brand

			if (Ingredient.groups.indexOf(ingObj.group) < 10)
			{
				var dose = Units.humanizeDose(ing[1], ingObj.unit)
				name += ' ' + dose[0] + ' ' + dose[1]
			}

			var a = Nct('a', 'cocktail-ingredient', name)
			a['data-ingredient'] = ingObj
			links.appendChild(a)
			links.appendChild(T(' '))
		}
		
		return links
	},
	
	renderCol: function(byIngredients)
	{
		var ratingIngr = this.nodes.ratingIngredient
		
		for (var i = 0, il = byIngredients.length; i < il; i++)
		{
			var group = byIngredients[i]
			
			var col = Nc('div', 'rating-col')
			ratingIngr.appendChild(col)
			
			var h2 = Nct('h2', 'rating-name', group.name)
			col.appendChild(h2)
			
			var count = Nct('span', 'count', group.cocktails.length + ' из ' + group.count)
			h2.appendChild(count)
			
			var list = Nc('ul', 'rating-list')
			col.appendChild(list)
			
			
			var firstCocktail = group.cocktails[0]
			
			var firstItem = Nc('li', 'first-item')
			list.appendChild(firstItem)
			
			firstItem.appendChild(firstCocktail.getLinkImage(false, true))
			
			var h3 = N('h3')
			firstItem.appendChild(h3)
			
			var link = Nct('a', 'cocktail-name', firstCocktail.name)
			link.href = firstCocktail.getPath()
			h3.appendChild(link)
			
			var position = Nc('div', 'cocktail-position')
			firstItem.appendChild(position)
			
			var arrowClass = ''
			if (firstCocktail.ingrArrow)
			{
				if (firstCocktail.ingrArrow > 0)
					arrowClass = 'arrow up'
				else if (firstCocktail.ingrArrow < 0)
					arrowClass = 'arrow down'
			}
			
			var positionArrow = Nc('span', arrowClass)
			position.appendChild(positionArrow)
			position.appendChild(T('1-ая позиция в текущем рейтинге'))
			
			var ingredients = Nc('div', 'cocktail')
			firstItem.appendChild(ingredients)
			ingredients.appendChild(this.renderIngredientLinks(firstCocktail.ingredients))
			
			var rating = Nct('div', 'cocktail-rating', firstCocktail.totalPos)
			firstItem.appendChild(rating)
				
			var arrowClass = ''
			if (firstCocktail.totalArrow)
				arrowClass += 'arrow ' + firstCocktail.totalArrow

			var ratingArrow = Nc('span', arrowClass)
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
				
				var arrowClass = ''
				if (cocktail.ingrArrow)
				{
					if (cocktail.ingrArrow > 0)
						arrowClass = 'arrow up'
					else if (cocktail.ingrArrow < 0)
						arrowClass = 'arrow down'
				}
				
				var positionArrow = Nc('span', arrowClass)
				position.appendChild(positionArrow)

				var ingredients = Nc('div', 'cocktail')
				item.appendChild(ingredients)
				
				var h3 = N('h3')
				ingredients.appendChild(h3)
				
				var link = Nct('a', 'cocktail-name', cocktail.name)
				link.href = cocktail.getPath()
				h3.appendChild(link)
				
				ingredients.appendChild(this.renderIngredientLinks(cocktail.ingredients))

				
				var rating = Nct('div', 'cocktail-rating', cocktail.totalPos)
				item.appendChild(rating)
					
				var arrowClass = ''
				if (cocktail.totalArrow)
					arrowClass += 'arrow ' + cocktail.totalArrow
	
				var ratingArrow = Nc('span', arrowClass)
				rating.appendChild(ratingArrow)
			}
		}
	}
}

Papa.View = Me

})();
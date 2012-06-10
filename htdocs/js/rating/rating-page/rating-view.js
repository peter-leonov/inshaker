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
			
			for (var j = 0, jl = cocktail.ingredients.length; j < jl; j++) 
			{
				var ing = cocktail.ingredients[j]
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
				ingredients.appendChild(a)
				ingredients.appendChild(T(' '))
			}
			ratingTotal.appendChild(li)
		}
	},
	
	renderCol: function(cocktails)
	{
		
	}
}

Papa.View = Me

})();
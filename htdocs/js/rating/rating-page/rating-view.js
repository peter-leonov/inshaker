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
				a.href = ingObj.pageHref()
				ingredients.appendChild(a)
				ingredients.appendChild(T(' '))
			}
			ratingTotal.appendChild(li)
		}
	}
}

Papa.View = Me

})();
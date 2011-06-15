;(function(){

var Me = CocktailCart.View
eval(NodesShortcut.include())

var myProto =
{
	bind : function (nodes)
	{
		this.nodes = nodes
		var me = this
		
		var cloner = this.cloner = new Cloner()
		var cloneNodes = 
		{
			alcoholBox : nodes.alcoholBox,
			alcoholList : nodes.alcoholList,
			nonAlcoholBox : nodes.nonAlcoholBox,
			nonAlcoholList : nodes.nonAlcoholList
		}
		cloner.bind(nodes.pageWrapper, cloneNodes)
		
		var clone = cloner.create()
	},
	
	renderBarName : function(barName)
	{
		if(!barName)
		{
			return
		}
		
		this.nodes.barName.empty()
		this.nodes.barName.appendChild(T(barName))
	},
	
	renderCocktails : function(alcoholCocktails, nonAlcoholCocktails)
	{
		var nodes = this.nodes
		var perPage = 12
		var clone = this.cloner.create()
		var df = document.createDocumentFragment()
		var items = perPage
		var me = this
		var append = true
		
		clone.root.addClassName('first-clone')
		var alcoLen = alcoholCocktails.length
		if(alcoLen != 0)
		{
			clone.root.addClassName('first-alco-clone')
			for (var i = 0; i < alcoLen; i++) 
			{
				var cocktail = alcoholCocktails[i]
				var li = renderCocktail(cocktail)
				li.addClassName(i%2 ? 'odd' : 'even')
				df.appendChild(li)
				append = false
				if(--items <= 0)
				{
					clone.nodes.alcoholList.appendChild(df)
					clone.nodes.alcoholBox.show()
					clone.root.show()
					nodes.main.appendChild(clone.root)
					createPageWrapper()
					append = true
				}
			}
		}
		
		if(append == false)
		{
			clone.nodes.alcoholList.appendChild(df)
			clone.nodes.alcoholBox.show()
			clone.root.show()
			nodes.main.appendChild(clone.root)
			df = document.createDocumentFragment()
			items = perPage - 2
			append = true	
		}
		
		var nonAlcoLen = nonAlcoholCocktails.length
		if(nonAlcoLen != 0)
		{
			items -= 2
			if(items <= 0)
			{
				createPageWrapper()
			}
			clone.root.addClassName('first-non-alco-clone')
			for (var i = 0; i < nonAlcoLen; i++) 
			{
				var cocktail = nonAlcoholCocktails[i]
				var li = renderCocktail(cocktail)
				li.addClassName(i%2 ? 'odd' : 'even')
				df.appendChild(li)
				append = false
				if(--items <= 0)
				{
					clone.nodes.nonAlcoholList.appendChild(df)
					clone.nodes.nonAlcoholBox.show()				
					clone.root.show()
					nodes.main.appendChild(clone.root)
					createPageWrapper()
					append = true
				}
			}
		}
		
		clone.root.addClassName('last-clone')
		
		if(append == false)
		{
			clone.nodes.nonAlcoholList.appendChild(df)
			clone.nodes.nonAlcoholBox.show()
			clone.root.show()
			nodes.main.appendChild(clone.root)
		}
		
		function createPageWrapper()
		{	
			items = perPage
			df = document.createDocumentFragment()
			clone = me.cloner.create()			
		}
		
		function renderCocktail(cocktail)
		{
			var li = Nc('li', 'cocktail')
			var table = N('table')
			var tr = N('tr')
			
			var imgTd = Nc('td', 'img-td')
			var img = new Image()
			img.src = cocktail.getBigImageSrc()
			img.addClassName('cocktail-image')
			var path = '/cocktail/' + cocktail.name_eng.htmlName() + '/'
			var a = N('a')
			a.href = path
			a.className = 'img-link'
			a.appendChild(img)
			imgTd.appendChild(a)
			tr.appendChild(imgTd)
			
			var recipeTd = Nc('td', 'recipe-td')
			var cocktailName = Nct('a', 'cocktail-name', cocktail.name)
			cocktailName.href = path
			recipeTd.appendChild(cocktailName)
			var recipe = []
			for (var j = 0, jl = cocktail.ingredients.length; j < jl; j++) 
			{
				var ing = cocktail.ingredients[j]
				var ingObj = Ingredient.getByName(ing[0])
				var brand = ingObj.brand
				recipe.push(ing[0] + (brand ? ' ' + brand : '') + (Ingredient.groups.indexOf(ingObj.group) < 8 ? ' ' + ing[1] : ''))
			}
			var recipeDiv = Nct('div', 'cocktail-recipe', recipe.join(', '))
			recipeTd.appendChild(recipeDiv)		
			tr.appendChild(recipeTd)
			
			table.appendChild(tr)
			li.appendChild(table)
			return li	
		}
	},
	
	renderIngredients : function(ingredients)
	{
		var inode = this.nodes.ingredients
		if(ingredients.length == 0)
			inode.main.hide()
	
		inode.main.show()
		
		var ul = N('ul')
		for (var i = 0, il = ingredients.length; i < il; i++) 
		{
			ul.appendChild(Nct('li', 'ing-name', ingredients[i].name))
		}
		
		inode.wrapper.empty()
		inode.wrapper.appendChild(ul)
	},
	
	handleBarMenuClick : function(e)
	{
		var target = e.target
		if(target.cocktail)
		{
			if(target.notAvailable)
			{
				this.controller.addCocktailToBarMenu(target.cocktail.name)
			}
			else
			{
				this.controller.removeCocktailFromBarMenu(target.cocktail.name)
			}
		}
	}
}

Object.extend(Me.prototype, myProto)

})();
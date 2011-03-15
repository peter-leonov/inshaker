;(function(){

var Me = BarMenu.View
eval(NodesShortcut.include())

var myProto =
{
	bind : function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		
		nodes.barName.wrapper.addEventListener('click', function(e){ me.handleBarNameClick(e) }, false)
		document.body.addEventListener('click', function(e){ me.barNameChanging(e) }, true)
		nodes.barName.form.addEventListener('submit', function(e){ me.handleNewBarName(e) }, false)		
		nodes.barName.input.addEventListener('keypress', function(e){ me.handleBarNameKeypress(e) }, false)
		
		nodes.barName.input.bName = true
		nodes.barName.title.bTitle = true
		
		nodes.barMenu.wrapper.addEventListener('click', function(e){ me.handleBarMenuClick(e) }, false)
	},
	
	renderBarName : function(barName)
	{
		var nodes = this.nodes.barName
		
		if(barName)
		{
			this.nodes.barName.bName.innerHTML = barName
			
			nodes.help.hide()
			nodes.bName.show()
		}	
		else
		{
			nodes.help.show()
			nodes.bName.hide()
		}
		
		if(this.barIsChanging)
		{
			this.barIsChanging = false
			nodes.title.show()
			nodes.form.hide()
		}
	},
	
	handleBarNameClick : function(e)
	{
		var node = e.target,
			nodes = this.nodes.barName
		if(node.parentNode.bTitle)
		{
			nodes.title.hide()
			nodes.form.show()
			
			var currBarName = this.controller.getBarName()
			nodes.input.value = currBarName
			
			if(!nodes.input.value)
				nodes.tip.show()
			else
				nodes.tip.hide()
			
			this.barIsChanging = true
			nodes.input.focus()
		}
	},
	
	barNameChanging : function(e)
	{
		if(!this.barIsChanging) return
		if(e.target.bName) return
		
		this.handleNewBarName()
	},
	
	handleNewBarName : function(e)
	{
		if(e)
			e.preventDefault()
		var input = this.nodes.barName.input,
			notEmpty = /\S/.test(input.value)
		
		if(!notEmpty) input.value = ''
		
		this.controller.setNewBarName(notEmpty ? input.value : this.nodes.barName.tip.innerHTML)
	},
	
	handleBarNameKeypress : function(e)
	{
			var tip = this.nodes.barName.tip
			setTimeout(function(){
				if(e.target.value == '')
					tip.show()
				else
					tip.hide()
			}, 1)
	},
		
	renderBarMenu : function(cocktails, notAvailableCocktails, alcoholCocktails)
	{
		if(!cocktails.length)
		{
			this.nodes.barMenu.wrapper.empty()
			this.nodes.barMenu.empty.show()
			return
		}
		
		this.nodes.barMenu.empty.hide()
		
		function renderList(showAlcohol)
		{
			var ul =  Nc('ul', 'list')
			var title = Nct('h3', 'cocktails-type', showAlcohol ? 'Алкогольные' : 'Безалкогольные')
			for (var i = 0, j = 0, il = cocktails.length; i < il; i++) 
			{
				var c = cocktails[i]
				
				if(showAlcohol && !alcoholCocktails[c.name] || !showAlcohol && alcoholCocktails[c.name])
					continue
					
				j++
				
				var li = Nc('li', 'cocktail')
				
				var img = new Image()
				img.src = c.getBigImageSrc()
				img.addClassName('cocktail-image')
				
				var path = '/cocktail/' + c.name_eng.htmlName()
				var a = N('a')
				a.href = path + '/'
				a.className = 'link'
				
				a.appendChild(img)
				
				li.appendChild(a)
				
				var h3 = Nct('h3', 'cocktail-name', c.name)
				h3.cocktail = c
				li.appendChild(h3)
				
				
	
				var recipe = []
				for (var j = 0, jl = c.ingredients.length; j < jl; j++) 
				{
					var ing = c.ingredients[j]
					var ingObj = Ingredient.getByName(ing[0])
					var brand = ingObj.brand
					recipe.push(ing[0] + (brand ? ' ' + brand : '') + (Ingredient.groups.indexOf(ingObj.group) < 8 ? ' ' + ing[1] : ''))
				}
				
				var p = Nct('p', 'cocktail-recipe', '(' + recipe.join(', ') + ')')
				li.appendChild(p)
				
				if(notAvailableCocktails[c.name])
				{
					h3.notAvailable = true
					li.addClassName('not-available')
				}
				
				ul.appendChild(li)
			}
			
			if(!j)
				return false
			
			var wrapper = Nc('div', 'list-wrapper ' + (showAlcohol ? 'alcohol' : 'no-alcohol'))
			
			wrapper.appendChild(title)
			wrapper.appendChild(ul)
			return wrapper
		}
		
		var df = document.createDocumentFragment()
		
		//alcohol
		var alcohol = renderList(true)
		if(alcohol)
			df.appendChild(alcohol)
		
		//no-alcohol
		var noAlcohol = renderList(false)
		if(noAlcohol)
			df.appendChild(noAlcohol)
		
		this.nodes.barMenu.wrapper.empty()
		this.nodes.barMenu.wrapper.appendChild(df)
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
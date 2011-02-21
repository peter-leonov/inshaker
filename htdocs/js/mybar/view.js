;(function(){
var Papa = MyBar, Me = Papa.View
eval(NodesShortcut.include())
var myProto =
{
	getPreviewNodeOriginal : Ingredient.prototype.getPreviewNode,
	
	initialize : function()
	{
		this.nodes = {}
		
		var me = this
		
		Ingredient.prototype.getPreviewNode = function(addFlag, removeFlag)
		{
			var ingr = me.getPreviewNodeOriginal.call(this)
			
			if(!addFlag && !removeFlag) return ingr
			
			var li = Nc('li', 'ingredient')
			
			if(addFlag)
			{
				ingr.addClassName('not-in-bar')
				var ctrl = Nct('span', 'add-ingredient', '+')
				ctrl.addingIngredient = this
				ctrl.setAttribute('title', 'Добавить')
			}
			
			else if(removeFlag)
			{
				ingr.addClassName('in-bar')
				var ctrl = Nct('span', 'remove-ingredient', '×')
				ctrl.removingIngredient = this
				ctrl.setAttribute('title', 'Удалить ингредиент')				
			}
			
			ctrl.style.opacity = 0
			
			li.addEventListener('mouseover', function(){ ctrl.animate(false, { opacity : 1 }, 0.2) }, true)
			li.addEventListener('mouseout', function(){ ctrl.animate(false, { opacity : 0 }, 0.2) }, true)
			
			li.appendChild(ctrl)
			li.appendChild(ingr)
			
			return li
		}
		
	},
	
	bind : function (nodes)
	{
		this.nodes = nodes
		this.incl = new IngredientedCocktailList()
		this.incl.bind({main: nodes.cocktails.wrapper})
		
		var me = this
		
		nodes.ingredients.tipIngredient.addEventListener('click', function(e){ me.controller.addIngredientToBar(this.ingredient) }, false)
		
		nodes.ingredients.searchForm.addEventListener('submit', function (e) { e.preventDefault(); me.controller.ingrQuerySubmit(nodes.ingredients.queryInput.value); }, false)
		nodes.ingredients.list.addEventListener('click', function(e){ me.handleIngredientClick(e) }, false)
		nodes.bottomOutput.wrapper.addEventListener('click', function(e){ me.handleIngredientClick(e) }, false)
		
		nodes.cocktails.switcher.addEventListener('click', function(e){ me.handleCocktailsSwitcherClick(e) }, false)
		nodes.ingredients.switcher.addEventListener('click', function(e){ me.handleIngredientsSwitcherClick(e) }, false)
		
		nodes.barName.wrapper.addEventListener('click', function(e){ me.handleBarNameClick(e) }, false)
		document.body.addEventListener('click', function(e){ me.barNameChanging(e) }, true)
		nodes.barName.form.addEventListener('submit', function(e){ me.handleNewBarName(e) }, false)		
		nodes.barName.input.addEventListener('keypress', function(e){ me.handleBarNameKeypress(e) }, false)
		
		nodes.barName.input.bName = true
		nodes.barName.title.bTitle = true
		nodes.ingredients.resetButton.addEventListener('click', function(){ me.clearInput() }, false)
		
		var completer = this.completer = new PlainInputAutocompleter()
		completer.bind({ main : nodes.ingredients.queryInput, list : nodes.ingredients.complete })
		completer.addEventListener('accept', function (e) { me.controller.ingrQuerySubmit(e.value) }, false)
		
		nodes.menuLink.addEventListener('click', function(e){ if(!this.hasClassName('active')) e.preventDefault(); }, false)
		nodes.bottomOutput.output.addEventListener('click', function(e){ me.handleBottomOutputClick(e) }, false)
		
		//suspended rendering
		var t = new Throttler(onscroll, 100, 500)
		window.addEventListener('scroll', function () { t.call() }, false)
		
		function onscroll()
		{
			var frame = me.recommendsFrame
			if(frame)
				frame.moveTo(window.pageXOffset, window.pageYOffset - 2500)
		}
	},
	
	renderRecommendIngredient : function(node)
	{
		
	},
	
	setCompleterDataSource : function (ds)
	{
		this.completer.setDataSource(ds)
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
	
	renderIngredients : function(ingredients, showByGroups, tipIngredient)
	{
		var ingr = this.nodes.ingredients
		
		ingr.tipIngredient.innerHTML = tipIngredient.name
		ingr.tipIngredient.ingredient = tipIngredient
		
		if(ingredients.length == 0)
		{
			ingr.list.empty()
			ingr.empty.show()
			ingr.switcher.hide()
			return
		}
		
		ingr.empty.hide()
		ingr.switcher.show()
		
		if(showByGroups)
		{
			ingr.swList.addClassName('link')
			ingr.swGroups.removeClassName('link')
			
			var dl = N('dl')
			for(var i = 0, l = ingredients.length, groupName = ''; i < l; i++)
			{
				var ingredient = ingredients[i]
				if(groupName != ingredient.group)
				{
					groupName = ingredient.group
					
					if(i != 0)
					{
						dl.appendChild(dt)
						dl.appendChild(dd)
					}
					
					var dt = Nct('dt', 'group-name', groupName)
					var dd = Nc('dd', 'group')
				}
				
				dd.appendChild(ingredients[i].getPreviewNode(false, true))
			}
			
			dl.appendChild(dt)
			dl.appendChild(dd)			
			
			ingr.list.empty()
			ingr.list.appendChild(dl)			
		}
		else
		{
			ingr.swGroups.addClassName('link')
			ingr.swList.removeClassName('link')
			
			var ul = N('ul')
			for(var i = 0, l = ingredients.length; i < l; i++)
			{
				ul.appendChild(ingredients[i].getPreviewNode(false, true))
			}
			
			ingr.list.empty()
			ingr.list.appendChild(ul)
		}
	},
	
	renderCocktails : function(cocktails, showPhotos)
	{
		var cl = cocktails.length
		var c = this.nodes.cocktails
		
		c.amount.innerHTML = cl + ' ' + cl.plural('коктейля', 'коктейлей', 'коктейлей')
		
		if(cocktails.length == 0)
		{
			this.renderIfCocktailsEmpty()
			return
		}
		/*
				if(!c.empty.hasClassName('hidden'))
					c.empty.hide()*/
		
		c.block.show()
		
		this.nodes.menuLink.addClassName('active')
			
		c.switcher.show()
			
		if(showPhotos)
		{
			c.swPhotos.removeClassName('link')
			c.swCombs.addClassName('link')
			
			var ul = Nc('ul', 'photos-list')
			for (var i = 0, il = cocktails.length; i < il; i++) 
			{
				var cNode = cocktails[i].getPreviewNode()
				ul.appendChild(cNode)
			}
			c.wrapper.empty()
			c.wrapper.appendChild(ul)
			
			c.wrapper.show()
		}
		else
		{
			c.swCombs.removeClassName('link')
			c.swPhotos.addClassName('link')
			
			var me = this
			setTimeout(function()
			{
				me.incl.setCocktails([{cocktails : cocktails}])
			}, 1)
			
			c.wrapper.show()
		}
	},
	
/*
	renderBottomOutput : function(mustHave, boItems, showPackages, havingIngredients, havingCocktails)
	{
		//mustHave render		
		if(showPackages)
		{
			var i = 0
			for (var k in havingIngredients) 
			{
				if(havingIngredients[k]) i++
			}
			if(i == 0) boItems = []
			this.renderBoPackages(boItems, havingIngredients)
		}
		else
		{
			this.renderBoByCocktails(boItems)
		}
		
		this.mustHaveRender(mustHave)
	},
*/	
	setupRecommendsVisibilityFrame : function(nodes)
	{
		if (!nodes.length)
			return
		
		var boxes = Boxer.nodesToBoxes(nodes)
		
		var frame = this.recommendsFrame = new VisibilityFrame()
		frame.setFrame(4000, 5000) // hardcoded for now
		frame.setStep(4000, 3000)
		frame.moveTo(0, -2500)
		
		var me = this
		frame.onmove = function (show, hide)
		{
			for (var i = 0; i < show.length; i++)
			{
				var box = show[i]
				if (!box.loaded)
				{
					var node = box.node
						
					if(node.mustHaveIngredient)
						node.appendChild(me.rendernOneMustHaveRecommend(node.mustHaveIngredient))
					
					else if(node.group)
						node.appendChild(me.renderOneRecommend(node.group))
						
					node.removeClassName('lazy')
					
					box.loaded = true
				}
			}
		}
		
		frame.setBoxes(boxes)		
	},

	renderBottomOutput : function(mustHaveRecommends, recommends)
	{
		//this.renderBoByCocktails(recommends)
		var items = []
		items = items.concat(this.bottomRecommendsRender(recommends))
		items = items.concat(this.mustHaveRender(mustHaveRecommends))
		
		this.setupRecommendsVisibilityFrame(items)
		
		window.scrollBy(0, -1)
		window.scrollBy(0, 1)
	},
	
	rendernOneMustHaveRecommend : function(mustHaveIngredient)
	{
			var df = document.createDocumentFragment()
			
			var bigPlus = Nct('div', 'big-plus', '+')
			bigPlus.ingredients = [mustHaveIngredient.ingredient]
			
			var ing = Nc('div', 'ingredient')
			ing.appendChild(mustHaveIngredient.ingredient.getPreviewNode())
			
			df.appendChild(bigPlus)
			df.appendChild(ing)
			
			var desc = Nc('p', 'description')
			desc.innerHTML = mustHaveIngredient.description
			df.appendChild(desc)
			
			return df
	},

	renderOneRecommend : function(group)
	{
		var df = document.createDocumentFragment()
		var ingredients = group.ingredients,
			cocktails = group.cocktails,
			cl = cocktails.length
		
		var dd = N('dd'),	
			eq = Nct('li', 'eq', '='),
			head = Nc('ul', 'head'),
			bigPlus = Nct('li', 'big-plus', '+')
		
		bigPlus.ingredients = ingredients
		
		head.appendChild(bigPlus)
		for (var j = 0, jl = ingredients.length; j < jl; j++)
		{
			var ing = Nc('li', 'ingredient')
			ing.appendChild(ingredients[j].getPreviewNode())
			head.appendChild(ing)
		}
		
		head.appendChild(eq)		
		df.appendChild(head)
		
		var body = Nc('ul', 'body')
		
		for (var j = 0, jl = cocktails.length; j < jl; j++)
			body.appendChild(cocktails[j].getPreviewNode())
		
		df.appendChild(body)			
		
		return df	
	},
	
	bottomRecommendsRender : function(groups)
	{	
		var dl = Nc('dl', 'show-by-cocktails')
		var items = []
		
		for (var i = 0, il = groups.length; i < il; i++) 
		{
			var dd = Nc('dd', 'lazy')
			items.push(dd)
			dd.group = groups[i]
			dl.appendChild(dd)
		}
		
		var main = this.nodes.bottomOutput.recommends
		main.empty()
		main.appendChild(dl)
		
		return items	
	},
	
	mustHaveRender : function(mustHave)
	{
		var mustHaveUl = N('ul')
		var items = []
		for (var i = 0, il = mustHave.length; i < il; i++) 
		{
			var li = Nc('li', 'row lazy')	
			li.mustHaveIngredient = mustHave[i]
			items.push(li)
			mustHaveUl.appendChild(li)
		}
		
		var main = this.nodes.bottomOutput.mustHave
		main.empty()
		main.appendChild(mustHaveUl)
		
		return items
	},
	
	renderBoPackages : function(cocktails, havingIngredients)
	{
		var main = this.nodes.bottomOutput.recommends
		
		var ul = Nc('ul', 'packages')
		
		for (var i = 0, il = cocktails.length; i < il; i++) 
		{
			var cocktail = cocktails[i],
				li = Nc('li', 'package'),
				ingDiv = Nc('ul', 'ingredients list'),
				cocktailDiv = Nc('div', 'cocktail')
				
			cocktailDiv.appendChild(cocktail.getPreviewNode())
			
			for (var j = 0, jl = cocktail.ingredients.length; j < jl; j++) 
			{
				var ingName = cocktail.ingredients[j][0]
				if(!havingIngredients[ingName])
				{					
					var item = Nc('li', 'ingredient')
					item.appendChild(Ingredient.getByName(ingName).getPreviewNode())
					ingDiv.appendChild(item)
				}
			}
			
			var bigPlus = Nct('div', 'big-plus', '+')
			bigPlus.ingredients = cocktail.ingredients.map(function(a){ return Ingredient.getByName(a[0]) })
			
			li.appendChild(bigPlus)
			li.appendChild(ingDiv)
			li.appendChild(Nct('div', 'eq', '='))
			li.appendChild(cocktailDiv)
			
			ul.appendChild(li)
		}
		
		main.empty()
		main.appendChild(ul)
	},
	
	renderBoByCocktails : function(groups)
	{
		var main = this.nodes.bottomOutput.recommends
	
		var dl = Nc('dl', 'show-by-cocktails')
		
		for (var i = 0, il = groups.length; i < il; i++) 
		{
			(function(){
			var ingredient = groups[i].ingredient,
				cocktails = groups[i].cocktails,
				cl = cocktails.length
			
			var dt = Nc('dt', 'title-label') 
				dd = N('dd'),	
				ing = Nc('li', 'ingredient'),
				eq = Nct('li', 'eq', '='),
				head = Nc('ul', 'head'),
				bigPlus = Nct('li', 'big-plus', '+')
			
			bigPlus.ingredients = [ingredient]
			ing.appendChild(ingredient.getPreviewNode())
			
			head.appendChild(bigPlus)
			head.appendChild(ing)
			head.appendChild(eq)
			
			dd.appendChild(head)
			
			var body = Nc('ul', 'body')
			
			for (var j = 0; j < cl; j++)
				body.appendChild(cocktails[j].getPreviewNode())
			
			dd.appendChild(body)			
			dl.appendChild(dd)
			
			})()
		}
		
		main.empty()
		main.appendChild(dl)	
	},
	
	renderIfCocktailsEmpty : function()
	{
		var c = this.nodes.cocktails
		
		c.block.hide()
	},
	
	clearInput : function()
	{
		this.nodes.ingredients.queryInput.value = ''
	},
	
	handleIngredientClick : function(e)
	{
		var node = e.target
		if(node.addingIngredient)
			this.controller.addIngredientToBar(node.addingIngredient)
		else if(node.removingIngredient)
			this.controller.removeIngredientFromBar(node.removingIngredient)
	},

	handleCocktailsSwitcherClick : function(e)
	{
		var node = e.target
		if(node.hasClassName('link'))
		{
			if(node.hasClassName('photos'))
			{
				this.controller.switchCocktailsView(true)
			}
			else
			{
				this.controller.switchCocktailsView(false)
			}
		}
	},
	
	handleIngredientsSwitcherClick : function(e)
	{
		var node = e.target
		if(node.hasClassName('link'))
		{
			if(node.hasClassName('by-groups'))
			{
				this.controller.switchIngredientsView(true)
			}
			else
			{
				this.controller.switchIngredientsView(false)
			}
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
			//var l = currBarName.length
			
			//l = l < 30 ? 30 : l > 30 ? l*1.1 : l
			
			nodes.input.value = currBarName
			//nodes.input.setAttribute('size', l)
			
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
	
	handleBoTitleClick : function(e)
	{
		var target = e.target
		if(target.hasClassName('link'))
		{
			if(target.hasClassName('easy-to-make'))
				this.controller.switchBoShowType(false)
			else
				this.controller.switchBoShowType(true)
		}
	},
	
	handleBottomOutputClick : function(e)
	{
		var target = e.target
		if(target.ingredients)
		{
			this.controller.addIngredientsFromBo(target.ingredients)
		}
	}
}
Object.extend(Me.prototype, myProto)
})();
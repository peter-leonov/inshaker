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
		nodes.ingrSearchForm.addEventListener('submit', function (e) { e.preventDefault(); me.controller.ingrQuerySubmit(me.nodes.ingrQueryInput.value); }, false)
		nodes.ingrList.addEventListener('click', function(e){ me.handleIngredientClick(e) }, false)
		nodes.recommBlocks.wrapper.addEventListener('click', function(e){ me.handleIngredientClick(e) }, false)
		nodes.bottomOutput.wrapper.addEventListener('click', function(e){ me.handleIngredientClick(e) }, false)
		nodes.bottomOutput.title.addEventListener('click', function(e){ me.handleBoTitleClick(e) }, false)
		
		nodes.cocktails.switcher.addEventListener('click', function(e){ me.handleCocktailSwitcherClick(e) }, false)
		
		nodes.barName.wrapper.addEventListener('click', function(e){ me.handleBarNameClick(e) }, false)
		document.body.addEventListener('click', function(e){ me.barNameChanging(e) }, true)
		nodes.barName.form.addEventListener('submit', function(e){ me.handleNewBarName(e) }, false)		
		nodes.barName.input.addEventListener('keypress', function(e){ me.handleBarNameKeypress(e) }, false)
		
		nodes.barName.input.bName = true
		nodes.barName.title.bTitle = true
		nodes.ingrResetButton.addEventListener('click', function(){ me.clearInput() }, false)
		
		var completer = this.completer = new PlainInputAutocompleter()
		completer.bind({ main : nodes.ingrQueryInput, list : nodes.ingrComplete })
		completer.addEventListener('accept', function (e) { me.controller.ingrQuerySubmit(e.value) }, false)
	},
	
	setCompleterDataSource: function (ds)
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
	
	renderIngredients : function(ingredients /*, haveIngredients*/)
	{
		if(ingredients.length == 0)
		{
			this.renderIfIngredientsEmpty()
			return
		}
		this.nodes.ingrEmpty.hide()
		var ul = N('ul')
		for(var i = 0, l = ingredients.length; i < l; i++)
		{
			ul.appendChild(ingredients[i].getPreviewNode(false, true))
		}
		this.nodes.ingrList.empty()
		this.nodes.ingrList.appendChild(ul)
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
		
		if(!c.empty.hasClassName('hidden'))
			c.empty.hide()
			
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
	
	renderRecommBlocks : function(groups)
	{
		var inYourBar = groups.ingrInYourBar,
			rb = this.nodes.recommBlocks
		
		if(inYourBar && inYourBar.length)
		{
			var ul = N('ul')
			for (var i = 0, il = 3; i < il; i++)
			{
				if(!inYourBar[i]) break
				ul.appendChild(inYourBar[i].getPreviewNode(true))
			}
			rb.inYourBarList.empty()
			rb.inYourBarList.appendChild(ul)
			rb.inYourBar.show()
		}
		else
			rb.inYourBar.hide()
		
		var inGoodBar = groups.ingrInGoodBar

		if(inGoodBar && inGoodBar.length)
		{
			var ul = N('ul')
			for (var i = 0, il = 3; i < il; i++)
			{
				if(!inGoodBar[i]) break
				ul.appendChild(inGoodBar[i].getPreviewNode(true))
			}
			rb.inGoodBarList.empty()
			rb.inGoodBarList.appendChild(ul)
			rb.inGoodBar.show()
		}
		else
			rb.inGoodBar.hide()

		var ingrOfMonth = groups.ingrOfMonth
		
		if(ingrOfMonth && ingrOfMonth.length)
		{
			var ul = N('ul')
			for (var i = 0, il = 1; i < il; i++)
			{
				if(!ingrOfMonth[i]) break
				ul.appendChild(ingrOfMonth[i].getPreviewNode(true))
			}
			
			rb.ingrOfMonthList.empty()
			rb.ingrOfMonthList.appendChild(ul)
			rb.ingrOfMonth.show()
		}
		else
			rb.ingrOfMonth.hide()
	},
	
	renderBottomOutput : function(boItems, showByCocktails)
	{
		if(showByCocktails)
		{
			this.renderBoByCocktails(boItems)
		}
		else
		{
			this.renderBoEasyToMake(boItems.cocktails, boItems.notInBar)
		}
	},
	
	renderBoEasyToMake : function(cocktails, notInBar)
	{
		bo = this.nodes.bottomOutput
		
		bo.swIngreds.removeClassName('link')
		bo.swCocktails.addClassName('link')
		
		var div = Nc('div', 'ing-list')
		
		setTimeout(function()
		{
				var incl = new IngredientedCocktailList()
				incl.bind({ main : div })
				incl.setCocktails([{ cocktails : cocktails, notInBar : notInBar }])
		}, 1)

		bo.wrapper.empty()
		bo.wrapper.appendChild(div)	
	},
	
	renderBoByCocktails : function(groups)
	{
		bo = this.nodes.bottomOutput
		
		bo.swCocktails.removeClassName('link')
		bo.swIngreds.addClassName('link')
		
		var dl = Nc('dl', 'show-by-cocktails')
		
		for (var i = 0, il = groups.length; i < il; i++) 
		{
			(function(){
			var ingredient = groups[i].ingredient,
				cocktails = groups[i].cocktails,
				cl = cocktails.length
			
			var dt = Nc('dt', 'title-label') 
			var dd = N('dd')
			
			dt.innerHTML = 'Если в твоем баре будет ' + ingredient.name + ', сможешь приготовить ' + cl + ' ' + cl.plural('новый коктейль', 'новых коктейля', 'новых коктейлей')
				
			var ing = ingredient.getPreviewNode(true, false)
			var eq = Nct('li', 'eq', '=')
			
			var head = Nc('ul', 'head')
			
			head.appendChild(ing)
			head.appendChild(eq)
			
			dd.appendChild(head)
			
			var body = Nc('ul', 'body')
			
			for (var j = 0; j < cl; j++)
				body.appendChild(cocktails[j].getPreviewNode())
			
			dd.appendChild(body)			
			dl.appendChild(dt)
			dl.appendChild(dd)
			
			})()
		}
		
		bo.wrapper.empty()
		bo.wrapper.appendChild(dl)	
	},
	
	renderIfCocktailsEmpty : function()
	{
		var c = this.nodes.cocktails
		
		if(!c.wrapper.hasClassName('hidden'))
			c.wrapper.hide()
		
		if(!c.switcher.hasClassName('hidden'))
			c.switcher.hide()
		
		c.empty.show()
	},
	
	
	/*
	renderRecommends : function(recommends, inBar)
	{
		if(recommends.length == 0)
		{
			this.renderIfRecommendsEmpty()
			return
		}
		if(!this.nodes.recommBlocksEmpty.hasClassName('hidden'))
			this.nodes.recommBlocksEmpty.hide()
		
		var me = this
		this.inBar = inBar
			
		//OMG!!! o_0
		setTimeout(function()
		{
			me.incl.setCocktails(recommends, inBar)
		}, 1)
		this.nodes.recommBlocksWrapper.show()
	},
	*/
	renderIfIngredientsEmpty : function()
	{
		this.nodes.ingrList.empty()
		this.nodes.ingrEmpty.show()
	},
	
	renderIfRecommendsEmpty : function()
	{
		this.nodes.recommBlocksWrapper.hide()
		this.nodes.recommBlocksEmpty.show()
	},
	
	clearInput : function()
	{
		this.nodes.ingrQueryInput.value = ''
	},
	
	handleIngredientClick : function(e)
	{
		var node = e.target
		if(node.addingIngredient)
			this.controller.addIngredientToBar(node.addingIngredient)
		else if(node.removingIngredient)
			this.controller.removeIngredientFromBar(node.removingIngredient)
	},

	handleCocktailSwitcherClick : function(e)
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
	}
}
Object.extend(Me.prototype, myProto)
})();
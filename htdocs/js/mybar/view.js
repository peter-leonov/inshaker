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
			
			var li = N('li')
			
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
		nodes.recommends.wrapper.addEventListener('click', function(e){ me.handleIngredientClick(e) }, false)
		//nodes.recommendsWrapper.addEventListener('click', function(e){ me.handleIngredientClick(e) }, false)
		
		nodes.cocktails.switcher.addEventListener('click', function(e){ me.handleSwitcherClick(e) }, false)
		
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
		this.nodes.cocktails.amount.innerHTML = cl + ' ' + cl.plural('коктейля', 'коктейлей', 'коктейлей')
		
		if(cocktails.length == 0)
		{
			this.renderIfCocktailsEmpty()
			return
		}
		
		if(!this.nodes.cocktails.empty.hasClassName('hidden'))
			this.nodes.cocktails.empty.hide()
			
		this.nodes.cocktails.switcher.show()
			
		if(showPhotos)
		{
			this.nodes.cocktails.swPhotos.removeClassName('link')
			this.nodes.cocktails.swCombs.addClassName('link')
			
			var ul = Nc('ul', 'photos-list')
			for (var i = 0, il = cocktails.length; i < il; i++) 
			{
				var cNode = cocktails[i].getPreviewNode()
				ul.appendChild(cNode)
			}
			this.nodes.cocktails.wrapper.empty()
			this.nodes.cocktails.wrapper.appendChild(ul)
			
			this.nodes.cocktails.wrapper.show()
		}
		else
		{
			this.nodes.cocktails.swCombs.removeClassName('link')
			this.nodes.cocktails.swPhotos.addClassName('link')
			
			var me = this
			setTimeout(function()
			{
				me.incl.setCocktails([{cocktails : cocktails}])
			}, 1)
			
			this.nodes.cocktails.wrapper.show()
		}
	},
	
	renderRecommIngr : function(groups)
	{
		var inYourBar = groups.ingrInYourBar
		
		if(inYourBar)
		{
			var ul = N('ul')
			for (var i = 0, il = 3; i < il; i++)
			{
				if(!inYourBar[i]) break
				ul.appendChild(inYourBar[i].getPreviewNode(true))
			}
			this.nodes.recommends.inYourBarList.empty()
			this.nodes.recommends.inYourBarList.appendChild(ul)
			this.nodes.recommends.inGoodBar.show()
		}
		else
			this.nodes.recommends.inYourBar.hide()
		


		var inGoodBar = groups.ingrInGoodBar

		if(inGoodBar)
		{
			var ul = N('ul')
			for (var i = 0, il = 3; i < il; i++)
			{
				if(!inGoodBar[i]) break
				ul.appendChild(inGoodBar[i].getPreviewNode(true))
			}
			this.nodes.recommends.inGoodBarList.empty()
			this.nodes.recommends.inGoodBarList.appendChild(ul)
			this.nodes.recommends.inGoodBar.show()
		}
		else
			this.nodes.recommends.inGoodBar.hide()


		var ingrOfMonth = groups.ingrOfMonth
		
		if(ingrOfMonth)
		{
			var ul = N('ul')
			for (var i = 0, il = 1; i < il; i++)
			{
				if(!ingrOfMonth[i]) break
				ul.appendChild(ingrOfMonth[i].getPreviewNode(true))
			}
			
			this.nodes.recommends.ingrOfMonthList.empty()
			this.nodes.recommends.ingrOfMonthList.appendChild(ul)
			this.nodes.recommends.ingrOfMonth.show()
		}
		else
			this.nodes.recommends.ingrOfMonth.hide()
	},
	
	renderIfCocktailsEmpty : function()
	{
		if(!this.nodes.cocktails.wrapper.hasClassName('hidden'))
			this.nodes.cocktails.wrapper.hide()
		
		if(!this.nodes.cocktails.switcher.hasClassName('hidden'))
			this.nodes.cocktails.switcher.hide()
		
		this.nodes.cocktails.empty.show()
	},
	
	/*
	renderRecommends : function(recommends, inBar)
	{
		if(recommends.length == 0)
		{
			this.renderIfRecommendsEmpty()
			return
		}
		if(!this.nodes.recommendsEmpty.hasClassName('hidden'))
			this.nodes.recommendsEmpty.hide()
		
		var me = this
		this.inBar = inBar
			
		//OMG!!! o_0
		setTimeout(function()
		{
			me.incl.setCocktails(recommends, inBar)
		}, 1)
		this.nodes.recommendsWrapper.show()
	},
	*/
	renderIfIngredientsEmpty : function()
	{
		this.nodes.ingrList.empty()
		this.nodes.ingrEmpty.show()
	},
	
	renderIfRecommendsEmpty : function()
	{
		this.nodes.recommendsWrapper.hide()
		this.nodes.recommendsEmpty.show()
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

	handleSwitcherClick : function(e)
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
	}
}
Object.extend(Me.prototype, myProto)
})();
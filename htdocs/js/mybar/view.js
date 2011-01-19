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
		
		Ingredient.prototype.getPreviewNode = function()
		{
			var ingr = me.getPreviewNodeOriginal.call(this)
			if(me.inBar && !me.inBar[this.name])
			{
				ingr.addClassName('not-in-bar')
				var add = Nct('span', 'add-ingredient', '+')
				add.addingIngredient = this
				add.setAttribute('title', 'Добавить ингредиент')
				add.style.opacity = 0
				ingr.appendChild(add)
				ingr.addEventListener('mouseover', function(){ add.animate(false, { opacity : 1 }, 0.2) }, true)
				ingr.addEventListener('mouseout', function(){ add.animate(false, { opacity : 0 }, 0.2) }, true)
			}
			return ingr
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
		//nodes.recommendsWrapper.addEventListener('click', function(e){ me.handleIngredientClick(e) }, false)
		
		nodes.cocktails.switcher.addEventListener('click', function(e){ me.handleSwitcherClick(e) }, false)
		
		var completer = this.completer = new PlainInputAutocompleter()
		completer.bind({ main : nodes.ingrQueryInput, list : nodes.ingrComplete })
		completer.addEventListener('accept', function (e) { me.controller.ingrQuerySubmit(e.value) }, false)
	},
	
	setCompleterDataSource: function (ds)
	{
		this.completer.setDataSource(ds)
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
			(function(){
			var ingr = ingredients[i],
				ingrNode = ingr.getPreviewNode(),
				//inBar = haveIngredients[ingr.name] || false,
				li = Nc('li','in-bar'),
				ctrl = Nct('span', 'remove-ingredient', '×')
				
			ctrl.style.opacity = 0
			ctrl.setAttribute('title', 'Убрать')
			ctrl.removingIngredient = ingr
			li.appendChild(ctrl)
			li.appendChild(ingrNode)
			li.addEventListener('mouseover', function(){ ctrl.animate(false, { opacity : 1 }, 0.25) }, true)
			li.addEventListener('mouseout', function(){ ctrl.animate(false, { opacity : 0 }, 0.25) }, true)
			ul.appendChild(li)
			})()
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
	
	renderIfCocktailsEmpty : function()
	{
		this.nodes.cocktails.wrapper.hide()
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
	}
}
Object.extend(Me.prototype, myProto)
})();
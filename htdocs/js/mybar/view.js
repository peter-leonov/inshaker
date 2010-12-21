;(function(){

var Papa = MyBar, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize : function()
	{
		this.nodes = {}
	},
	
	bind : function (nodes)
	{
		this.nodes = nodes
		
		this.incl = new IngredientedCocktailList()
		this.incl.bind({main: nodes.recommendsWrapper})
		
		var me = this
		
		nodes.ingrSearchForm.addEventListener('submit', function (e) { e.preventDefault(); me.controller.ingrQuerySubmit(me.nodes.ingrQueryInput.value); }, false)
		nodes.cocktailSearchForm.addEventListener('submit', function (e) { e.preventDefault(); me.controller.cocktailQuerySubmit(me.nodes.cocktailQueryInput.value); }, false)
		nodes.ingredientsList.addEventListener('click', function(e){ me.handleIngredientClick(e) }, false)
		nodes.recommendsWrapper.addEventListener('click', function(e){ me.handleCocktailClick(e) }, false)
		nodes.cocktailsList.addEventListener('click', function(e){ me.handleCocktailClick(e) }, false)
	},
	
	renderCocktails : function(cocktails, ingredsInBar)
	{
		if(cocktails.length == 0)
		{
			this.renderIfCocktailsEmpty('Пусто!')
			return
		}
		
		for(var i = 0, ul = N('ul'), l = cocktails.length; i < l; i++)
		{
			(function(){
			var cocktail = cocktails[i],
				li = cocktail.getPreviewNode(false, true),
				rmv = Nct('span', 'remove-cocktail', '×'),
				t = 0,
				needIngr = []
				
			for (var j = 0, jl = cocktail.ingredients.length; j < jl; j++)
			{
				if(ingredsInBar[cocktail.ingredients[j][0]])
					t++
				else
					needIngr.push(cocktail.ingredients[j][0])
			}
			
			
			var img = li.firstChild.firstChild, k = t/jl
			img.style.opacity = t == 0 || k < 0.1 ? 0.1 : k
			if(needIngr.length != 0)
				img.setAttribute('title', 'Не хватает ингредиентов: ' + needIngr.join(', '))
					
			rmv.style.opacity = 0
			rmv.setAttribute('title', 'Убрать из бара')
			rmv.removingCocktail = cocktail
			li.appendChild(rmv)
			li.addEventListener('mouseover', function(){ rmv.animate(false, { opacity : 1 }, 0.25) }, true)
			li.addEventListener('mouseout', function(){ rmv.animate(false, { opacity : 0 }, 0.25) }, true)
			ul.appendChild(li)
			})()
		}
		
		this.nodes.cocktailsList.empty()
		this.nodes.cocktailsList.appendChild(ul)
	},
	
	renderIngredients : function(ingredients, haveIngredients)
	{
		if(ingredients.length == 0)
		{
			this.renderIfIngredientsEmpty('Пусто!')
			return
		}
		
		var ulNotInBar = N('ul'), ulInBar = N('ul')
		
		for(var i = 0, l = ingredients.length; i < l; i++)
		{
			(function(){
			var ingr = ingredients[i],
				ingrNode = ingr.getPreviewNode(),
				inBar = haveIngredients[ingr.name] || false,
				li = Nc('li', inBar ? 'in-bar' : 'not-in-bar'),
				ctrl = inBar ? Nct('span', 'remove-ingredient', '×') : Nct('span', 'add-ingredient', '+')
				
			ctrl.style.opacity = 0
			if( !inBar )
			{
				ctrl.setAttribute('title', 'У меня это есть')
				ctrl.addingIngredient = ingr
			}
			else
			{
				ctrl.setAttribute('title', 'У меня этого нет')
				ingrNode.appendChild(Nc('div', 'tick'))
				ctrl.removingIngredient = ingr
			}

			li.appendChild(ctrl)
			li.appendChild(ingrNode)
			li.addEventListener('mouseover', function(){ ctrl.animate(false, { opacity : 1 }, 0.25) }, true)
			li.addEventListener('mouseout', function(){ ctrl.animate(false, { opacity : 0 }, 0.25) }, true)
			
			if(inBar)
				ulInBar.appendChild(li)
			else
				ulNotInBar.appendChild(li)
			})()
		}
		
		
		if(this.nodes.ingrSearchBox.hasClassName('hidden'))
		{
			var plus = Nct('li', 'add','+'), me = this
			plus.setAttribute('title', 'Добавить ингредиент')
			plus.addEventListener('click', function(){ this.hide(); me.nodes.ingrSearchBox.show() }, false)
			ulNotInBar.appendChild(plus)
		}
		this.nodes.ingredientsList.empty()
		this.nodes.ingredientsList.appendChild(ulInBar)
		this.nodes.ingredientsList.appendChild(ulNotInBar)
	},
	
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
		
		//OMG!!! o_0
		setTimeout(function()
		{
			me.incl.setCocktails(recommends, inBar)
			window.scrollBy(0, 1)
			window.scrollBy(0, -1)
		}, 1)
		
		this.nodes.recommendsWrapper.show()
	},
	
	renderIfCocktailsEmpty : function(label)
	{
		this.nodes.cocktailsList.empty()
		this.nodes.cocktailsList.appendChild(Nct('div', 'empty', label))
	},
	
	renderIfIngredientsEmpty : function(label)
	{
		this.nodes.ingredientsList.empty()
		
		if(this.nodes.ingrSearchBox.hasClassName('hidden'))
		{
			var plus = Nct('div', 'add','+'), me = this
			plus.setAttribute('title', 'Добавить ингредиент')
			plus.addEventListener('click', function(){ this.hide(); me.nodes.ingrSearchBox.show() }, false)
			this.nodes.ingredientsList.appendChild(plus)
		}
		else
			this.nodes.ingredientsList.appendChild(Nct('div', 'empty', label))
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
	
	handleCocktailClick	: function(e)
	{
		var node = e.target
		if(node.removingCocktail)
			this.controller.removeCocktailFromBar(node.removingCocktail)
		else if(node.addingCocktail)
			this.controller.addCocktailToBar(node.addingCocktail)
	}
}

Object.extend(Me.prototype, myProto)

})();

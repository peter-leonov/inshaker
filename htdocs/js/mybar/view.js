;(function(){

var Papa = MyBar, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize : function()
	{
		
	},
	
	bind : function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		
		nodes.ingrSearchForm.addEventListener('submit', function (e) { e.preventDefault(); me.controller.ingrQuerySubmit(me.nodes.ingrQueryInput.value); }, false)
		nodes.cocktailSearchForm.addEventListener('submit', function (e) { e.preventDefault(); me.controller.cocktailQuerySubmit(me.nodes.cocktailQueryInput.value); }, false)
	},
	
	renderCocktails : function(cocktails)
	{
		if(cocktails.length == 0) { this.renderIfCocktailsEmpty('Пусто!'); return }
		
		for(var i = 0, ul = N('ul'), l = cocktails.length; i < l; i++)
		{
			(function(){
			var li = cocktails[i].getPreviewNode(false, true), 
				rmv = Nct('span', 'remove-cocktail', 'x')
			
			rmv.style.opacity = 0
			rmv.setAttribute('title', 'Убрать из бара')
			rmv.removingCocktailName = cocktails[i].name
			li.appendChild(rmv)
			li.addEventListener('mouseover', function(){ rmv.animate(false, { opacity : 1 }, 0.25) }, true)
			li.addEventListener('mouseout', function(){ rmv.animate(false, { opacity : 0 }, 0.25) }, true)
			ul.appendChild(li)
			})()
		}
		
		var me = this
		ul.addEventListener('click', function(e){ me.handleCocktailClick(e) }, false)
		
		this.nodes.cocktailsList.empty()
		this.nodes.cocktailsList.appendChild(ul)
	},
	
	renderIngredients : function(ingredients)
	{
		if(ingredients.length == 0) { this.renderIfIngredientsEmpty('Пусто!'); return }
		
		for(var i = 0, ul = N('ul'), l = ingredients.length; i < l; i++)
		{
			(function(){
			var ingr = ingredients[i],
				ingrNode = ingr.getPreviewNode(), 
				li = Nc('li', ingr.inBar ? 'in-bar' : 'not-in-bar'),
				ctrl = ingr.inBar ? Nct('span', 'remove-ingredient', 'x') : Nct('span', 'add-ingredient', '+')
				
			ctrl.style.opacity = 0
			if( !ingr.inBar )
			{
				ctrl.setAttribute('title', 'У меня это есть')
				ctrl.addingIngredientName = ingr.name
			}
			else 
			{
				ctrl.setAttribute('title', 'У меня этого нет')
				ingrNode.appendChild(Nc('div', 'tick'))
				ctrl.removingIngredientName = ingr.name
			}

			li.appendChild(ctrl)
			li.appendChild(ingrNode)
			li.addEventListener('mouseover', function(){ ctrl.animate(false, { opacity : 1 }, 0.25) }, true)
			li.addEventListener('mouseout', function(){ ctrl.animate(false, { opacity : 0 }, 0.25) }, true)
			ul.appendChild(li)
			})()
		}
		
		var me = this
		ul.addEventListener('click', function(e){ me.handleIngredientClick(e) }, false)
		
		this.nodes.ingredientsList.empty();
		this.nodes.ingredientsList.appendChild(ul)
	},
	
	renderIfCocktailsEmpty : function(label)
	{
		this.nodes.cocktailsList.empty()
		this.nodes.cocktailsList.appendChild(Nct('div', 'empty', label))
	},
	
	renderIfIngredientsEmpty : function(label)
	{
		this.nodes.ingredientsList.empty()
		this.nodes.ingredientsList.appendChild(Nct('div', 'empty', label))
	},
	
	renderIfRecommendsEmpty : function(label)
	{
		this.nodes.recommendsWrapper.empty()
		this.nodes.recommendsWrapper.appendChild(Nct('div', 'empty', label))
	},
	
	renderRecommends : function(recommends)
	{
		if(recommends.length == 0) this.renderIfRecommendsEmpty('Пусто!')
		
		var df = document.createDocumentFragment(), me=this
		for( var j = 0, f = true; j < recommends.length; j++)
		{
			(function(){
			var cocktails = recommends[j]
			if(cocktails.length == 0 && f) { me.renderIfRecommendsEmpty('Пусто!'); return }
			else{f=false}
			
			for (var i = 0, ul = N('ul'), il = cocktails.length; i < il; i++) 
			{
				ul.appendChild(cocktails[i].getPreviewNode(false, true))	
			}
			
			switch(j)
			{
				case 0: var label = 'Можешь точно приготовить'; break;
				case 1: var label = 'Можешь приготовить, добавив 1 ингредиент'; break;
				case 2: var label = 'Можешь приготовить, добавив 2 ингредиента'; break;
			}
			
			var dl = N('dl'),
				dt = Nct('dt', 'title', label),
				dd = Nc('dl', 'list')
				
			dd.appendChild(ul)
			dl.appendChild(dt)
			dl.appendChild(dd)
			df.appendChild(dl)
			})()
		}
		this.nodes.recommendsWrapper.empty()
		this.nodes.recommendsWrapper.appendChild(df)
	},

	handleIngredientClick : function(e)
	{
		var node = e.target
		if(node.addingIngredientName) 
			this.controller.addIngredientToBar(node.addingIngredientName)
		else if(node.removingIngredientName)
			this.controller.removeIngredientFromBar(node.removingIngredientName)
	},
	
	handleCocktailClick	: function(e)
	{
		var node = e.target
		if(node.removingCocktailName)
			this.controller.removeCocktailFromBar(node.removingCocktailName)
	}
}

Object.extend(Me.prototype, myProto)

})();
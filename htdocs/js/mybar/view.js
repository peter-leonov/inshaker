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
			li.appendChild(rmv)
			li.addEventListener('mouseover', function(){ rmv.animate(false, { opacity : 1 }, 0.25) }, false)
			li.addEventListener('mouseout', function(){ rmv.animate(false, { opacity : 0 }, 0.25) }, false)
			ul.appendChild(li)
			})()
		}
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
				ctrl.setAttribute('title', 'У меня это есть') 
			else 
			{
				ctrl.setAttribute('title', 'У меня этого нет')
				ingrNode.appendChild(Nc('div', 'tick'))
			}
			li.appendChild(ctrl)
			li.appendChild(ingrNode)
			li.addEventListener('mouseover', function(){ ctrl.animate(false, { opacity : 1 }, 0.25) }, false)
			li.addEventListener('mouseout', function(){ ctrl.animate(false, { opacity : 0 }, 0.25) }, false)
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
	
	renderIfBarEmpty : function()
	{
		
	},
	
	handleIngredientClick : function(e)
	{
		var node = e.target
		if(node.hasClassName('add-ingredient')) 
			this.controller.addIngredientToBar(node.nextSibling['data-ingredient'])
		else if(node.hasClassName('remove-ingredient'))
			this.controller.removeIngredientFromBar(node.nextSibling['data-ingredient'])
	}
}

Object.extend(Me.prototype, myProto)

})();
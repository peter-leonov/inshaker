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
			var li = cocktails[i].getPreviewNode(false, true), 
				rmv = Nct('span', 'remove', 'x')

			rmv.setAttribute('title', 'Убрать из бара')
			li.appendChild(rmv)
			ul.appendChild(li)
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
			var ingr = ingredients[i]
				ingrNode = ingr.getPreviewNode(), 
				li = Nc('li', ingr.inBar ? 'in-bar' : 'not-in-bar'),
				ctrl = ingr.inBar ? Nct('span', 'remove', 'x') : Nct('span', 'add', '+')
				ctrl.style.opacity = 0
				
			//(ingr.inBar) ? ctrl.setAttribute('title', 'У меня это есть') : ctrl.setAttribute('title', 'У меня этого нет')
			li.appendChild(ctrl)
			li.appendChild(ingrNode)
			li.addEventListener('mouseover', function(){ ctrl.animate(false, { 'opacity' : 100 }, 0.6) }, false)
			li.addEventListener('mouseout', function(){ ctrl.animate(false, { 'opacity' : 0 }, 0.6) }, false)
			ul.appendChild(li)
			})()
		}

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
		
	}
}

Object.extend(Me.prototype, myProto)

})();
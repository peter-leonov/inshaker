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
			ul.appendChild(cocktails[i].getPreviewNode(false, true))

		this.nodes.cocktailsList.empty()
		this.nodes.cocktailsList.appendChild(ul)
	},
	
	renderIngredients : function(ingredients)
	{
		if(ingredients.length == 0) { this.renderIfIngredientsEmpty('Пусто!'); return }
		
		for(var i = 0, ul = N('ul'), l = ingredients.length; i < l; i++)
		{
			var ingr = ingredients[i], li = Nc('li', ingr.inBar ? 'in-bar' : 'not-in-bar')
			li.appendChild(ingr.getPreviewNode())
			ul.appendChild(li)
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
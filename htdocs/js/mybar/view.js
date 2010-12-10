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
		
		nodes.searchForm.addEventListener('submit', function (e) { e.preventDefault(); me.controller.searchQuerySubmit(me.nodes.queryInput.value); }, false)
	},
	
	renderCocktails : function(cocktails)
	{
		if(cocktails.length == 0) { this.renderIfCocktailsEmpty('Пусто!'); return }
		
		for(var i = 0, ul = N('ul'), l = cocktails.length; i < l; i++)
			ul.appendChild(cocktails[i].getPreviewNode(false, true))

		with(this.nodes.cocktailsList) { empty(); appendChild(ul) }
	},
	
	renderIngredients : function(ingredients)
	{
		if(ingredients.length == 0) { this.renderIfIngredientsEmpty('Пусто!'); return }
		
		for(var i = 0, ul = N('ul'), l = ingredients.length; i < l; i++)
		{
			var li = N('li')
			li.appendChild(ingredients[i].getPreviewNode())
			ul.appendChild(li)
		}

		with(this.nodes.ingredientsList) { empty(); appendChild(ul) }
	},
	
	renderIfCocktailsEmpty : function(label)
	{
		with(this.nodes.cocktailsList) { empty(); appendChild(Nct('div', 'empty', label)) }
	},
	
	renderIfIngredientsEmpty : function(label)
	{
		with(this.nodes.ingredientsList) { empty(); appendChild(Nct('div', 'empty', label)) }
	},
	
	renderIfBarEmpty : function()
	{
		
	}
}

Object.extend(Me.prototype, myProto)

})();
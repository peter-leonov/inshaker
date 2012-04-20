;(function(){

function Me ()
{
}

Me.prototype =
{
	bind: function (nodes)
	{
		IngredientPopup.bootstrap()
		
		document.documentElement.removeClassName('loading')
		
		var items = nodes.cocktailItems,
			cocktails = []
		for (var i = 0, il = items.length; i < il; i++)
		{
			var name = items[i].getAttribute('data-cocktail')
			
			var cocktail = Cocktail.getByName(name)
			if (!cocktail)
				continue
			
			cocktails.push(cocktail)
		}
		
		cocktails.sort(Cocktail.complexitySort)
		
		var groupName = nodes.groupName.getAttribute('data-name')
		
		var inco = new IngredientedCocktailList()
		inco.bind({main: nodes.list})
		inco.setCocktails([{name: groupName, cocktails: cocktails}])
		inco.wake()
		
		var me = this
		nodes.root.addEventListener('click', function (e) { me.maybeIngredientClicked(e) }, false)
	},
	
	findIngredientInParents: function (node)
	{
		do
		{
			var ingredient = node['data-ingredient'] || Ingredient.getByName(node.getAttribute('data-ingredient-name'))
			if (ingredient)
				return ingredient
		}
		while ((node = node.parentNode) && node != document)
		
		return null
	},
	
	maybeIngredientClicked: function (e)
	{
		var target = e.target
		
		var ingredient = this.findIngredientInParents(target)
		if (!ingredient)
			return
		
		e.preventDefault()
		this.showIngredient(ingredient)
	},
	
	showIngredient: function (ingredient)
	{
		if (ingredient)
		{
			var popup = IngredientPopup.show(ingredient)
			var me = this
			popup.onhide = function () { me.showIngredient(null) }
		}
		else
			IngredientPopup.hide()
	}
}

Me.className = 'CocktailGroup'
self[Me.className] = Me

})();

<!--# include virtual="/js/common/ingredient-popup.js" -->

<!--# include virtual="/js/combinator/ingrediented-cocktail-list.js" -->
<!--# include virtual="/js/combinator/ingredients-list.js" -->

;(function(){

function onready ()
{
	var nodes =
	{
		root: $('main-column'),
		groupName: $('group-name'),
		list: $('cocktail-list'),
		cocktailItems: $$('#cocktail-list li')
	}
	
	var widget = new CocktailGroup()
	widget.bind(nodes)
}

$.onready(onready)

})();

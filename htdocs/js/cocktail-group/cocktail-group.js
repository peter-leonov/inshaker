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
		nodes.list.addEventListener('click', function (e) { me.maybeIngredientClicked(e.target) }, false)
	},
	
	findIngredientInParents: function (node)
	{
		do
		{
			var ingredient = node['data-ingredient']
			if (ingredient)
				return ingredient
		}
		while ((node = node.parentNode))
		
		return null
	},
	
	maybeIngredientClicked: function (target)
	{
		var ingredient = this.findIngredientInParents(target)
		
		if (ingredient)
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

<!--# include virtual="/lib-0.3/modules/child-indexed-path.js"-->
<!--# include virtual="/lib-0.3/modules/cloner.js"-->

<!--# include virtual="/js/common/throttler.js" -->

<!--# include virtual="/js/common/popup.js" -->
<!--# include virtual="/js/common/ingredient-popup.js" -->

<!--# include virtual="/js/combinator/ingrediented-cocktail-list.js" -->
<!--# include virtual="/js/combinator/ingredients-list.js" -->

;(function(){

function onready ()
{
	var nodes =
	{
		groupName: $('group-name'),
		list: $('cocktail-list'),
		cocktailItems: $$('#cocktail-list li')
	}
	
	var widget = new CocktailGroup()
	widget.bind(nodes)
}

document.addEventListener('ready', onready, false)

})();

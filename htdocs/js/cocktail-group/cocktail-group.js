;(function(){

function Me ()
{
}

Me.prototype =
{
	bind: function (nodes)
	{
		IngredientPopup.bootstrap()
		
		document.documentElement.classList.remove('loading')
		
		// SEO: let search engines see the text block goes before giant cocktail list,
		// and for real users we move the text below the list:
		if (nodes.boxes[0])
			nodes.root.appendChild(nodes.boxes[0])
		
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
		
		cocktails.sort(Cocktail.sortByComplexity)
		
		var groupName = nodes.groupName.getAttribute('data-name')
		
		var inco = new IngredientedCocktailList()
		inco.bind({main: nodes.list, more: nodes.moreCocktails})
		inco.setCocktails({name: groupName, cocktails: cocktails})
		
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

<!--# include virtual="ingrediented-cocktail-list.js" -->
<!--# include virtual="/js/combinator/ingredients-list.js" -->

;(function(){

function onready ()
{
  UserAgent.setupDocumentElementClassNames()
  
	var nodes =
	{
		root: $('#main-column'),
		boxes: $$('#main-column .box'),
		groupName: $('#group-name'),
		list: $('#cocktail-list'),
		cocktailItems: $$('#cocktail-list li'),
		moreCocktails: $('#more .button')
	}
	
	var widget = new CocktailGroup()
	widget.bind(nodes)
}

$.onready(onready)

})();

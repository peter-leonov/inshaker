;(function(){

var myName = 'IngredientPopup'

function Me () {}

eval(NodesShortcut.include())

var methods =
{
	setup: function (nodes)
	{
		this.cache = {}
		this.nodes = nodes
		
		var cloner = this.cloner = new Cloner()
		cloner.bind(nodes.popupMain, nodes.popupParts)
	},
	
	show: function (ingredient)
	{
		Statistics.ingredientPopupOpened(ingredient)
		
		var popup = this.cache[ingredient.name]
		if (popup)
		{
			popup.show()
			return
		}
		
		var clone = this.cloner.create()
		this.nodes.root.appendChild(clone.root)
		
		var nodes = clone.nodes
		var popup = new Popup()
		this.cache[ingredient.name] = popup
		popup.bind({root: clone.root, window: nodes.window, front: nodes.front})
		popup.show()
		
		var brand = ingredient.brand
		if (brand)
		{
			nodes.mark.appendChild(T(ingredient.brand))
			nodes.ingredientWindow.addClassName('branded')
			nodes.brand.appendChild(T(ingredient.mark))
			nodes.brand.href = Ingredient.ingredientsLinkByMark(ingredient.mark)
		}
		
		nodes.name.appendChild(T(ingredient.name))
		
		var len = ingredient.cocktails.length
		if (len)
			nodes.allLink.appendChild(T(' ' + len + ' ' + len.plural('коктейль', 'коктейля', 'коктейлей')))
		
		if (ingredient.decls)
			nodes.allLink.appendChild(T(' ' + ingredient.decls.t))
		nodes.allLink.href = ingredient.combinatorLink()
		
		nodes.text.innerHTML = ingredient.about
		
		nodes.image.src = ingredient.getMainImageSrc()
		
		var me = this
		setTimeout(function () { me.renderCocktails(nodes, ingredient.cocktails) }, 0)
		require('Good', function () { me.renderWhereToBuy(nodes, ingredient) })
	},
	
	renderWhereToBuy: function (popupNodes, ingredient)
	{
		var good = Good.getBySellName(ingredient.name)[0]
		if (good)
		{
			popupNodes.ingredientWindow.addClassName('can-buy')
			popupNodes.buy.appendChild(T(good.name))
			popupNodes.buy.href = good.getHref()
		}
	},
	
	renderCocktails: function (popupNodes, cocktails)
	{
		cocktails = cocktails.slice().randomize()
		
		var cl = new CocktailList()
		var nodes =
		{
			root: popupNodes.cocktails,
			viewport: popupNodes.cocktailsViewport,
			surface: popupNodes.cocktailsSurface,
			prev: popupNodes.cocktailsPrev,
			next: popupNodes.cocktailsNext
		}
		cl.bind(nodes)
		cl.configure({pageLength: 5, pageVelocity: 38})
		cl.setCocktails(cocktails)
	}
}

Object.extend(Me, methods)

Me.className = myName
self[myName] = Me

})();
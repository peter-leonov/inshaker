;(function(){

var myName = 'IngredientPopup'

eval(NodesShortcut.include())

var Super = Popup,
	superProto = Super.prototype

function Me ()
{
	Super.apply(this)
}

Me.prototype = new Super()

var myProto =
{
	setIngredient: function (ingredient)
	{
		this.ingredient = ingredient
		this.render()
	},
	
	render: function ()
	{
		var ingredient = this.ingredient
		
		Statistics.ingredientPopupOpened(ingredient)
		
		var clone = this.cloner.create()
		this.popupRoot.appendChild(clone.root)
		
		var nodes = clone.nodes
		nodes.root = clone.root
		
		// implies this.nodes = nodes
		this.bind(nodes)
		
		var brand = ingredient.brand
		if (brand)
		{
			nodes.mark.appendChild(T(ingredient.brand))
			nodes.ingredientWindow.addClassName('branded')
			nodes.brand.appendChild(T(ingredient.mark))
			nodes.brand.href = Ingredient.ingredientsLinkByMark(ingredient.mark)
		}
		
		nodes.name.appendChild(T(ingredient.name))
		
		var minor = Ingredient.getByGroups(['Лед'])
		var coefficients = {}
		for (var i = 0, il = minor.length; i < il; i++)
			coefficients[minor[i].name] = 0.001
		
		
		var supplements = Cocktail.getSupplementByIngredientName(ingredient.name, coefficients)
		
		nodes.combinations.addEventListener('click', function (e) { if (e.target.href) popup.hide() }, false)
		
		
		var list = nodes.combinationsList
		for (var i = 0, il = supplements.length; i < il && i < 7; i++)
		{
			var supplement = supplements[i]
			
			var item = Nc('li', 'combination')
			list.appendChild(item)
			
			var query = ingredient.name + ' + ' + supplement
			var a = Nct('a', 'link', query)
			a.href = '/combinator.html#q=' + encodeURIComponent(query)
			item.appendChild(a)
			// nodes.combinationsList.appendChild(T(query))
		}
		
		// var len = ingredient.cocktails.length
		// if (len)
		// 	nodes.allLink.appendChild(T(' ' + len + ' ' + len.plural('коктейль', 'коктейля', 'коктейлей')))
		// 
		// if (ingredient.decls)
		// 	nodes.allLink.appendChild(T(' ' + ingredient.decls.t))
		// nodes.allLink.href = ingredient.combinatorLink()
		
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

Object.extend(Me.prototype, myProto)

var myStatic =
{
	setup: function (nodes)
	{
		this.cache = {}
		
		var proto = this.prototype
		
		proto.popupRoot = nodes.root
		
		var cloner = proto.cloner = new Cloner()
		cloner.bind(nodes.popupMain, nodes.popupParts)
	},
	
	show: function (ingredient)
	{
		var popup = this.cache[ingredient.name]
		if (popup)
		{
			popup.show()
			return
		}
		
		var popup = new this()
		popup.setIngredient(ingredient)
		popup.show()
		
		this.cache[ingredient.name] = popup
	}
}

Object.extend(Me, myStatic)

Me.className = myName
self[myName] = Me

})();
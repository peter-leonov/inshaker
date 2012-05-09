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
	
	show: function ()
	{
		Statistics.ingredientPopupOpened(this.ingredient)
		return superProto.show.apply(this, arguments)
	},
	
	render: function ()
	{
		var clone = this.cloner.create()
		this.popupRoot.appendChild(clone.root)
		
		var nodes = clone.nodes
		nodes.root = clone.root
		
		// implies this.nodes = nodes
		this.bind(nodes)
		
		this.renderData()
		
		var popup = this
		this.ingredient.loadLocalData(function () { popup.renderLocalData() })
		
		this.renderPlugins()
	},
	
	renderData: function ()
	{
		this.nodes.image.src = this.ingredient.getMainImageSrc()
	},
	
	renderLocalData: function ()
	{
		var nodes = this.nodes
		var ingredient = this.ingredient
		
		var brand = ingredient.brand
		if (brand)
		{
			nodes.mark.appendChild(T(ingredient.brand))
			nodes.ingredientWindow.addClassName('branded')
			nodes.brand.appendChild(T(ingredient.mark))
			nodes.brand.href = Ingredient.ingredientsLinkByMark(ingredient.mark)
		}
		
		nodes.name.appendChild(T(ingredient.name))
		
		this.renderAllCocktailsLink(ingredient)
		
		nodes.text.innerHTML = ingredient.about
	},
	
	renderPlugins: function ()
	{
		var nodes = this.nodes,
			ingredient = this.ingredient
		
		this.renderSupplements(ingredient)
		
		var me = this
		setTimeout(function () { me.renderCocktails(nodes, ingredient) }, 0)
		require('Good', function () { me.renderWhereToBuy(nodes, ingredient) })
	},
	
	renderAllCocktailsLink: function (ingredient)
	{
		var nodes = this.nodes
		
		var count = Cocktail.getByIngredient(ingredient.name).length
		if (count == 0)
		{
			nodes.allCocktails.hide()
			return
		}
		
		nodes.allCocktails.show()
		
		var link = nodes.allCocktailsLink
		link.href = ingredient.combinatorLink()
		
		link.appendChild(T(' ' + count + ' ' + count.plural('коктейль', 'коктейля', 'коктейлей')))
		if (ingredient.decls)
			link.appendChild(T(' ' + ingredient.decls.t))
	},
	
	renderSupplements: function (ingredient)
	{
		var nodes = this.nodes
		
		if (Cocktail.getByIngredient(ingredient.name).length < 6)
		{
			nodes.combinations.hide()
			return
		}
		
		var coefficients = Ingredient.defaultSupplementCoefficients()
		var supplements = Cocktail.getSupplementNamesByIngredientName(ingredient.name, coefficients)
		
		var list = nodes.combinationsList
		for (var i = 0, il = supplements.length; i < il && i < 5; i++)
		{
			var supplement = supplements[i]
			
			var item = Nc('li', 'combination')
			list.appendChild(item)
			
			var query = ingredient.name + ' + ' + supplement
			var a = Nct('a', 'link', query)
			a.href = '/combinator.html#q=' + encodeURIComponent(query)
			item.appendChild(a)
		}
	},
	
	renderWhereToBuy: function (nodes, ingredient)
	{
		var good = Good.getBySellName(ingredient.name)[0]
		if (good)
		{
			nodes.ingredientWindow.addClassName('can-buy')
			nodes.buy.appendChild(T(good.name))
			nodes.buy.href = good.getHref()
		}
	},
	
	renderCocktails: function (nodes, ingredient)
	{
		var cocktails = Cocktail.getByGood(ingredient.name)
		cocktails.randomize()
		
		var cl = new CocktailList()
		cl.bind(nodes.cocktails)
		cl.configure({pageLength: 5, pageVelocity: 38})
		cl.setCocktails(cocktails)
	}
}

Object.extend(Me.prototype, myProto)

var myStatic =
{
	bind: function (nodes)
	{
		this.cache = {}
		
		var proto = this.prototype
		
		proto.popupRoot = nodes.root
		
		var cloner = proto.cloner = new Cloner()
		cloner.bind(nodes.popupMain, nodes.popupParts)
	},
	
	show: function (ingredient)
	{
		this.hide()
		
		var popup = this.cache[ingredient.name]
		if (!popup)
		{
			popup = this.cache[ingredient.name] = new this()
			popup.setIngredient(ingredient)
		}
		
		popup.show()
		this.popup = popup
		return popup
	},
	
	hide: function ()
	{
		var popup = this.popup
		if (!popup)
			return
		
		popup.hide()
		this.popup = null
	},
	
	bootstrap: function ()
	{
		var nodes =
		{
			root: document.body,
			popupMain: $('#ingredient-info-popup'),
			popupParts:
			{
				window: $$('#ingredient-info-popup .popup-window')[0],
				front: $$('#ingredient-info-popup .popup-front')[0],
				ingredientWindow: $$('#ingredient-info-popup .popup-window .ingredient-window')[0],
				image: $$('#ingredient-info-popup .description .image')[0],
				mark: $$('#ingredient-info-popup .description .about .mark')[0],
				brand: $$('#ingredient-info-popup .description .about .brand .link')[0],
				buy: $$('#ingredient-info-popup .description .about .where-to-buy .link')[0],
				name: $$('#ingredient-info-popup .description .about .name')[0],
				text: $$('#ingredient-info-popup .description .about .text')[0],
				allCocktails: $$('#ingredient-info-popup .description .about .all-cocktails')[0],
				allCocktailsLink: $$('#ingredient-info-popup .description .about .all-cocktails .link')[0],
				combinations: $$('#ingredient-info-popup .description .about .combinations')[0],
				combinationsList: $$('#ingredient-info-popup .description .about .combinations .list')[0],
				
				cocktails:
				{
					root: $$('#ingredient-info-popup .cocktail-list')[0],
					viewport: $$('#ingredient-info-popup .cocktail-list .viewport')[0],
					surface: $$('#ingredient-info-popup .cocktail-list .surface')[0],
					prev: $$('#ingredient-info-popup .cocktail-list .prev')[0],
					next: $$('#ingredient-info-popup .cocktail-list .next')[0]
				}
			}
		}
		
		this.bind(nodes)
	}
}

Object.extend(Me, myStatic)

Me.className = myName
self[myName] = Me

})();

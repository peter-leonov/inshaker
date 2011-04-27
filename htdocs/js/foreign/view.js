;(function(){

var Me = Foreign.View
eval(NodesShortcut.include())
var myProto =
{
	bind : function (nodes)
	{
		this.nodes = nodes
		var me = this
		nodes.output.addEventListener('click', function(e){ me.maybeIngredientClicked(e.target) }, false)
	},
	
	renderBarName : function(barName)
	{
		barName = barName || 'Безымянный бар'
		
		this.nodes.barName.empty()
		this.nodes.barName.appendChild(T(barName))
		this.nodes.title.empty()
		this.nodes.title.appendChild(T(barName + ' — Inshaker'))
	},
	
	renderLinkToMyBar : function(newbie)
	{
		this.nodes.linkToMybar.show()
		this.nodes.linkToMybar.addClassName(newbie ? 'newbie' : 'not-newbie')
	},
	
	renderIfFail : function(newbie)
	{
		this.renderLinkToMyBar(newbie)
		this.nodes.notFail.hide()
		this.nodes.fail.show()
		this.nodes.fail.addClassName(newbie ? 'newbie' : 'not-newbie')
	},
	
	renderIngredients : function(ingredients)
	{
		var ingr = this.nodes.ingredients
		
		if(ingredients.length == 0)
		{
			ingr.list.empty()
			ingr.empty.show()
			return
		}
		
		ingr.empty.hide()
		
		var ul = N('ul')
		for(var i = 0, l = ingredients.length; i < l; i++)
		{
			var li = Nc('li', 'ingredient')
			li.appendChild(ingredients[i].getPreviewNode())
			ul.appendChild(li)
		}
		
		ingr.list.empty()
		ingr.list.appendChild(ul)		
	},
	
	renderCocktails : function(cocktails)
	{
		var cl = cocktails.length
		
		var c = this.nodes.cocktails
		c.amount.empty()
		c.amount.appendChild(T(cl + ' ' + cl.plural('коктейля', 'коктейлей', 'коктейлей')))
		
		if(cocktails.length == 0)
		{
			c.empty.show()
			c.wrapper.hide()
			return
		}
		
		c.empty.hide()
		
		var ul = Nc('ul', 'photos-list')
		for (var i = 0, il = cocktails.length; i < il; i++) 
		{
			var cNode = cocktails[i].getPreviewNode()
			ul.appendChild(cNode)
		}
		c.wrapper.empty()
		c.wrapper.appendChild(ul)
		
		c.wrapper.show()		
	},
	
	maybeIngredientClicked : function(target)
	{
		if(!target.parentNode)
			return
		
		var ingredient = target.parentNode['data-ingredient']
		if(ingredient)
			this.controller.ingredientSelected(ingredient)
	},
	
	showIngredient: function (ingredient)
	{
		if (ingredient)
		{
			var popup = IngredientPopup.show(ingredient)
			var controller = this.controller
			popup.onhide = function () { controller.ingredientSelected(null) }
		}
		else
			IngredientPopup.hide()
	}
}

Object.extend(Me.prototype, myProto)

})();
;(function(){

var Me = Foreign.View
eval(NodesShortcut.include())
var myProto =
{
	bind : function (nodes)
	{
		this.nodes = nodes
		var me = this
		nodes.mainBox.addEventListener('click', function(e){ me.maybeIngredientClicked(e.target) }, false)
	},
	
	renderBarName : function(barName)
	{
		var nodes = this.nodes
		if(!barName)
		{
			return
		}
		
		nodes.ingredients.barName.empty()
		nodes.ingredients.barName.appendChild(T(barName))
		var firstChild = nodes.title.firstChild
		if (firstChild)
			firstChild.nodeValue = barName + ' — Inshaker'
	},
	
	renderIngredients : function(ingredients)
	{
		var nodes = this.nodes.ingredients
		
		if(ingredients.length == 0)
		{
			nodes.list.empty()
			nodes.empty.show()
			return
		}
		
		var ul = N('ul')
		for(var i = 0, l = ingredients.length; i < l; i++)
		{
			var li = Nc('li', 'ingredient')
			li.appendChild(ingredients[i].getPreviewNode())
			ul.appendChild(li)
		}
		
		nodes.list.empty()
		nodes.list.appendChild(ul)		
	},
	
	renderCocktails : function(cocktails)
	{
		var nodes = this.nodes.cocktails
		var cl = cocktails.length
		
		if(cocktails.length == 0)
		{
			nodes.empty.show()
			nodes.title.h2.classList.add('zero-cocktails')
			nodes.list.hide()
			return
		}
		
		nodes.title.plural.appendChild(T(cl + ' ' + cl.plural('коктейля', 'коктейлей', 'коктейлей')))
		
		var ul = Nc('ul', 'by-pics')
		for (var i = 0; i < cl; i++) 
		{
			var cNode = cocktails[i].getPreviewNode()
			ul.appendChild(cNode)
		}
		nodes.list.empty()
		nodes.list.appendChild(ul)
	},
	
	renderLinkToMyBar : function(newbie)
	{
		this.nodes.mybarLinkBox.classList.add(newbie ? 'newbie' : 'not-newbie')
	},
	
	renderIfFail : function(newbie)
	{
		var nodes = this.nodes
		nodes.ingredients.box.hide()
		nodes.cocktails.box.hide()
		nodes.failBox.show()
		this.renderLinkToMyBar(newbie)
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
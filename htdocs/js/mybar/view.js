;(function(){
var Papa = MyBar, Me = Papa.View
eval(NodesShortcut.include())
var myProto =
{
	initialize : function()
	{
		this.nodes = {}
	},
	
	bind : function (nodes)
	{
		this.nodes = nodes
		this.incl = new IngredientedCocktailList()
		this.incl.bind({main: nodes.recommendsWrapper})
		
		var me = this
		nodes.ingrSearchForm.addEventListener('submit', function (e) { e.preventDefault(); me.controller.ingrQuerySubmit(me.nodes.ingrQueryInput.value); }, false)
		nodes.ingrList.addEventListener('click', function(e){ me.handleIngredientClick(e) }, false)
		nodes.recommendsWrapper.addEventListener('click', function(e){ me.handleIngredientClick(e) }, false)
		
		var completer = this.completer = new PlainInputAutocompleter()
		completer.bind({ main : nodes.ingrQueryInput, list : nodes.ingrComplete })
		completer.addEventListener('accept', function (e) { me.controller.ingrQuerySubmit(e.value) }, false)
	},
	
	setCompleterDataSource: function (ds)
	{
		this.completer.setDataSource(ds)
	},
	
	renderIngredients : function(ingredients, haveIngredients)
	{
		if(ingredients.length == 0)
		{
			this.renderIfIngredientsEmpty()
			return
		}
		this.nodes.ingrEmpty.hide()
		var ul = N('ul')
		for(var i = 0, l = ingredients.length; i < l; i++)
		{
			(function(){
			var ingr = ingredients[i],
				ingrNode = ingr.getPreviewNode(),
				inBar = haveIngredients[ingr.name] || false,
				li = Nc('li','in-bar'),
				ctrl = Nct('span', 'remove-ingredient', '×')
				
			ctrl.style.opacity = 0
			ctrl.setAttribute('title', 'Убрать')
			ctrl.removingIngredient = ingr
			li.appendChild(ctrl)
			li.appendChild(ingrNode)
			li.addEventListener('mouseover', function(){ ctrl.animate(false, { opacity : 1 }, 0.25) }, true)
			li.addEventListener('mouseout', function(){ ctrl.animate(false, { opacity : 0 }, 0.25) }, true)
			ul.appendChild(li)
			})()
		}
		this.nodes.ingrList.empty()
		this.nodes.ingrList.appendChild(ul)
	},
	
	renderRecommends : function(recommends, inBar)
	{
		if(recommends.length == 0)
		{
			this.renderIfRecommendsEmpty()
			return
		}
		if(!this.nodes.recommendsEmpty.hasClassName('hidden'))
			this.nodes.recommendsEmpty.hide()
		var me = this
		//OMG!!! o_0
		setTimeout(function()
		{
			me.incl.setCocktails(recommends, inBar)
		}, 1)
		this.nodes.recommendsWrapper.show()
	},
	
	renderIfIngredientsEmpty : function()
	{
		this.nodes.ingrList.empty()
		this.nodes.ingrEmpty.show()
	},
	
	renderIfRecommendsEmpty : function()
	{
		this.nodes.recommendsWrapper.hide()
		this.nodes.recommendsEmpty.show()
	},
	
	handleIngredientClick : function(e)
	{
		var node = e.target
		if(node.addingIngredient)
			this.controller.addIngredientToBar(node.addingIngredient)
		else if(node.removingIngredient)
			this.controller.removeIngredientFromBar(node.removingIngredient)
	}
}
Object.extend(Me.prototype, myProto)
})();
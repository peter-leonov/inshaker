;(function(){

var Papa = CombinatorPage, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var inco = this.inco = new IngredientedCocktailList()
		inco.bind({main: nodes.output})
		
		var me = this
		
		function keypress (e) { setTimeout(function () { me.searchValueChanged(e.target.value) }, 1) }
		nodes.ingredientInput.addEventListener('keypress', keypress, false)
		
		return this
	},
	
	searchValueChanged: function (value)
	{
		var parts = value.replace(/^\s+|\s+$/g, '').split(/\s*\+\s*/)
		
		var names = []
		for (var i = 0, il = parts.length; i < il; i++)
		{
			var part = parts[i]
			if (part)
				names.push(part)
		}
		
		log(names)
	},
	
	renderCocktails: function (cocktails)
	{
		this.inco.setCocktails(cocktails)
	}
}

Object.extend(Me.prototype, myProto)

})();

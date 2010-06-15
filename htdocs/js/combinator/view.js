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
		var value = '+' + value.replace(/^\s+|\s+$/g, '')
		
		var m, lexer = /\s*([+-])\s*([^+-]*)/g
		
		var add = [], remove = []
		while ((m = lexer.exec(value)))
		{
			if (!m[2])
				continue
			
			if (m[1] == '+')
				add.push(m[2])
			else if (m[1] == '-')
				remove.push(m[2])
		}
		
		this.controller.setIngredientsNames(add, remove)
	},
	
	renderCocktails: function (cocktails)
	{
		this.inco.setCocktails(cocktails)
	}
}

Object.extend(Me.prototype, myProto)

})();

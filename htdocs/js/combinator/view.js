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
		
		return this
	},
	
	setCompleterDataSource: function (ds)
	{
		// this.completer.setDataSource(ds)
	},
	
	getValue: function ()
	{
		var input = this.nodes.ingredientInput
		input.focus()
		this.searchValueChanged(input.value)
	},
	
	searchValueChanged: function (value)
	{
		if (this.lastValue === value)
			return
		this.lastValue = value
		
		value = '+' + value.replace(/^\s+|\s+$/g, '')
		
		var m, lexer = /\s*([+-])\s*([^+-]*)/g
		
		var add = [], remove = []
		while ((m = lexer.exec(value)))
		{
			if (!m[2])
				continue
			
			var name = m[2].replace(/^\s+|\s+$/g, '')
			if (!name)
				continue
			
			if (m[1] == '+')
				add.push(name)
			else if (m[1] == '-')
				remove.push(name)
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

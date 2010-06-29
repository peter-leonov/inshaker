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
		
		nodes.ingredientInput.addEventListener('keypress', function () { setTimeout(function () { me.getValue() }, 0) }, false)
		
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
		this.searchValueMayBeChanged(input.value, input.selectionStart)
	},
	
	searchValueMayBeChanged: function (value, pos)
	{
		if (this.lastValue === value)
			return
		this.lastValue = value
		
		// trim
		value = value.replace(/^\s+|\s+$/g, '')
		
		// prepare for clean parsing
		value = '+' + value
		pos++
		
		var tokens = QueryParser.parse(value)
		
		var add = [], remove = []
		for (var i = 0, il = tokens.length; i < il; i++)
		{
			var t = tokens[i]
			if (t.op == '+')
				add.push(t.value)
			else if (t.op == '-')
				remove.push(t.value)
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

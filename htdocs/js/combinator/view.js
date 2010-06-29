;(function(){

var Papa = CombinatorPage, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
		this.tokens = []
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var inco = this.inco = new IngredientedCocktailList()
		inco.bind({main: nodes.output})
		
		var me = this
		nodes.ingredientInput.addEventListener('keypress', function () { setTimeout(function () { me.getValue() }, 0) }, false)
		nodes.ingredientInput.focus()
		
		return this
	},
	
	setCompleterDataSource: function (ds)
	{
		// this.completer.setDataSource(ds)
	},
	
	getValue: function ()
	{
		var input = this.nodes.ingredientInput
		this.searchValueMayBeChanged(input.value, input.selectionStart)
	},
	
	searchValueMayBeChanged: function (value, cursor)
	{
		// prepare for clean parsing
		value = '+' + value
		cursor++
		
		var tokens
		if (this.lastValue === value)
		{
			tokens = this.tokens
		}
		{
			tokens = this.tokens = QueryParser.parse(value)
			this.lastValue = value
		}
		
		var add = [], remove = [], active = -1
		for (var i = 0, il = tokens.length; i < il; i++)
		{
			var t = tokens[i]
			
			var op = t.op
			if (op == '+')
				add.push(t.value)
			else if (op == '-')
				remove.push(t.value)
			
			if (t.begin <= cursor && cursor <= t.end)
				active = i
		}
		
		tokens.active = tokens[active]
		
		this.controller.setIngredientsNames(add, remove)
		// this.controller.setIngredientsNames([tokens.active.value], [])
	},
	
	renderCocktails: function (cocktails)
	{
		this.inco.setCocktails(cocktails)
	}
}

Object.extend(Me.prototype, myProto)

})();

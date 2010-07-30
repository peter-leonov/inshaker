;(function(){

var Papa = CombinatorPage, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
		this.tokens = []
		this.tokens.active = {}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var inco = this.inco = new IngredientedCocktailList()
		inco.bind({main: nodes.cocktailList})
		
		var me = this
		
		var completer = this.completer = new AddingInputAutocompleter()
		completer.bind({main: nodes.ingredientInput, list: nodes.ingredientComplete})
		completer.addEventListener('accept', function (e) { me.queryUpdated(e.add, e.remove) }, false)
		// completer.addEventListener('empty', function (e) { me.queryUpdated(null, null) }, false)
		nodes.ingredientInput.focus()
		
		return this
	},
	
	setCompleterDataSource: function (ds)
	{
		this.completer.setDataSource(ds)
	},
	
	queryUpdated: function (add, remove)
	{
		this.controller.setIngredientsNames(add, remove)
	},
	
	
	renderCocktails: function (cocktails)
	{
		var output = this.nodes.output
		
		output.removeClassName('initial-state')
		output.removeClassName('result-state')
		output.removeClassName('empty-state')
		
		if (!cocktails)
		{
			output.addClassName('initial-state')
			return
		}
		
		if (cocktails.length)
			output.addClassName('result-state')
		else
			output.addClassName('empty-state')
		
		this.inco.setCocktails(cocktails)
	}
}

Object.extend(Me.prototype, myProto)

})();

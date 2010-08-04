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
		nodes.ingredientInput.focus()
		
		nodes.searchButton.addEventListener('click', function (e) { me.searchButtonClicked() }, false)
		
		return this
	},
	
	searchButtonClicked: function ()
	{
		this.completer.apply(this.nodes.ingredientInput.value)
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
		var nodes = this.nodes,
			output = nodes.output
		
		output.removeClassName('initial-state')
		output.removeClassName('result-state')
		output.removeClassName('empty-state')
		
		var inco = this.inco
		
		if (!cocktails)
		{
			output.addClassName('initial-state')
			inco.setCocktails([])
			return
		}
		
		var total = cocktails.length
		
		if (total == 0)
		{
			output.addClassName('empty-state')
			inco.setCocktails(cocktails)
			return
		}
		
		output.addClassName('result-state')
		inco.setCocktails(cocktails)
		
	}
}

Object.extend(Me.prototype, myProto)

})();

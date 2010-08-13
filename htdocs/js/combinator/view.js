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
		completer.addEventListener('changed', function (e) { me.searchInputValueChanged(e.add, e.remove) }, false)
		// nodes.ingredientInput.focus()
		
		nodes.searchButton.addEventListener('click', function (e) { me.searchButtonClicked() }, false)
		
		var controller = this.controller
		
		var s = this.sortbySelect = new Selecter()
		s.bind(nodes.sortbySelect)
		s.addEventListener('select', function (e) { controller.setSortBy(+e.data.num) }, false)
		
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
		for (var i = 0, il = add.length; i < il; i++)
			add[i] = add[i].trim().replace(/\s+/g, ' ')
		
		for (var i = 0, il = remove.length; i < il; i++)
			remove[i] = remove[i].trim().replace(/\s+/g, ' ')
		
		this.controller.setIngredientsNames(add, remove)
	},
	
	searchInputValueChanged: function (add, remove)
	{
		this.controller.setWithouts(add, remove)
	},
	
	renderSortbyOptions: function (options)
	{
		var s = this.sortbySelect
		s.setOptions(options)
		s.renderSelected(0)
	},
	
	renderSortby: function (selected)
	{
		this.sortbySelect.renderSelected(selected)
	},
	
	renderCocktails: function (cocktails, total)
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
		
		if (cocktails.length == 0)
		{
			output.addClassName('empty-state')
			inco.setCocktails(cocktails)
			return
		}
		
		output.addClassName('result-state')
		inco.setCocktails(cocktails)
		
		nodes.totalCocktails.firstChild.nodeValue = total + ' ' + total.plural('коктейль', 'коктейля', 'коктейлей')
	}
}

Object.extend(Me.prototype, myProto)

})();

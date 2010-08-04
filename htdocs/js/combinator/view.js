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
		
		var s = this.sortbySelect = new Selecter()
		s.bind(nodes.sortbySelect)
		s.addEventListener('select', function (e) { log(e.data.value) }, false)
		
		this.renderSortby
		([
			'от простых к сложным',
			'от сложных к простым',
			'по алфавиту',
			'по группам',
			'по дате размещения'
		])
		
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
	
	renderSortby: function (options, selected)
	{
		var s = this.sortbySelect
		s.setOptions(options)
		if (selected)
			s.renderSelectedValue(selected)
		else
			s.renderSelected(0)
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
		
		nodes.totalCocktails.firstChild.nodeValue = total + ' ' + total.plural('коктейль', 'коктейля', 'коктейлей')
	}
}

Object.extend(Me.prototype, myProto)

})();

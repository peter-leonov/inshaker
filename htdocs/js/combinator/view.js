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
		
		var inli = this.inli = new IngredientsList()
		inli.bind({main: nodes.ingredientsList})
		
		var me = this
		
		var completer = this.completer = new AddingInputAutocompleter()
		completer.bind({main: nodes.queryInput, list: nodes.ingredientComplete})
		completer.addEventListener('accept', function (e) { me.queryAccepted(e.add, e.remove) }, false)
		completer.addEventListener('changed', function (e) { me.queryChanged(e.add, e.remove) }, false)
		nodes.queryInput.focus()
		
		nodes.searchForm.addEventListener('submit', function (e) { e.preventDefault(); setTimeout(function () { me.searchFormSubmitted() }, 50) }, false)
		
		var controller = this.controller
		
		var s = this.sortbySelect = new Selecter()
		s.bind(nodes.sortbySelect)
		s.addEventListener('select', function (e) { controller.setSortBy(+e.data.num) }, false)
		
		nodes.suggestionsList.addEventListener('click', function (e) { me.maybeSuggestionClicked(e.target) }, false)
		nodes.helpLine.addEventListener('click', function (e) { me.maybeSuggestionClicked(e.target) }, false)
		nodes.ingredientsList.addEventListener('click', function (e) { me.maybeIngredientClicked(e.target) }, false)
		nodes.cocktailList.addEventListener('click', function (e) { me.maybeIngredientClicked(e.target) }, false)
		
		var lh = this.locationHash = new LocationHash().bind(window)
		lh.addEventListener('change', function (e) { me.locationHashUpdated() }, false)
		
		return this
	},
	
	locationHashUpdated: function ()
	{
		var hash = UrlEncode.parse(this.locationHash.get())
		
		var query = hash.q
		
		var parts = QueryParser.getParts(QueryParser.parse(query))
		
		this.controller.setState({add: parts.add, remove: parts.remove, query: query})
	},
	
	renderQuery: function (query)
	{
		this.completer.reset()
		this.nodes.queryInput.value = query
	},
	
	setBookmark: function (hash)
	{
		for (var k in hash)
		{
			if (!hash[k])
				delete hash[k]
		}
		// log(UrlEncode.stringify(hash))
		// this.locationHash.setRaw(UrlEncode.stringify(hash))
	},
	
	searchFormSubmitted: function ()
	{
		this.completer.apply(this.nodes.queryInput.value)
	},
	
	setCompleterDataSource: function (ds)
	{
		this.completer.setDataSource(ds)
	},
	
	queryAccepted: function (add, remove)
	{
		for (var i = 0, il = add.length; i < il; i++)
			add[i] = add[i].trim().replace(/\s+/g, ' ')
		
		for (var i = 0, il = remove.length; i < il; i++)
			remove[i] = remove[i].trim().replace(/\s+/g, ' ')
		
		this.controller.setQuery(add, remove, this.nodes.queryInput.value)
	},
	
	queryChanged: function (add, remove)
	{
		this.controller.queryChanged(add, remove)
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
		
		var inco = this.inco, inli = this.inli
		
		if (!cocktails)
		{
			output.addClassName('initial-state')
			inco.setCocktails([])
			inco.sleep()
			inli.wake()
			this.controller.updateInitialBlock()
			return
		}
		
		if (cocktails.length == 0)
		{
			inco.sleep()
			inli.sleep()
			output.addClassName('empty-state')
			inco.setCocktails(cocktails)
			return
		}
		
		inco.wake()
		inli.sleep()
		
		output.addClassName('result-state')
		inco.setCocktails(cocktails)
		
		nodes.totalCocktails.firstChild.nodeValue = total + ' ' + total.plural('коктейль', 'коктейля', 'коктейлей')
		nodes.sortedWord.firstChild.nodeValue = total.plural('отсортирован', 'отсортированы', 'отсортированы')
	},
	
	renderInitialBlock: function (groups)
	{
		this.inli.setIngredients(groups)
	},
	
	renderExamples: function (examples)
	{
		var nodes = this.nodes,
			s = nodes.hintSingle,
			d = nodes.hintDouble
		
		s.firstChild.nodeValue = examples[0][0]
		s['data-query-add'] = examples[0]
		d.firstChild.nodeValue = examples[1].join(' + ')
		d['data-query-add'] = examples[1]
	},
	
	renderSuggestions: function (suggestions)
	{
		var nodes = this.nodes,
			root = nodes.suggestions,
			list = nodes.suggestionsList
		
		list.empty()
		
		if (suggestions.length == 0)
		{
			root.toggleClassName('empty', true)
			return
		}
		
		root.toggleClassName('empty', false)
		
		for (var i = 0, il = suggestions.length; i < il; i++)
		{
			var s = suggestions[i]
			
			var item = Nc('li', 'item')
			
			var link = Nct('a', 'link', s.add.join(' + '))
			link['data-query-add'] = s.add
			item.appendChild(link)
			
			item.appendChild(Nct('span', 'count', ' (' + s.count + ' ' + s.count.plural('коктейль', 'коктейля', 'коктейлей') + ')'))
			
			list.appendChild(item)
		}
	},
	
	maybeSuggestionClicked: function (node)
	{
		var add = node['data-query-add']
		
		if (!add)
			return
		
		var query = add.join(' + ')
		this.nodes.queryInput.value = query
		this.queryAccepted(add, [])
	},
	
	findIngredientInParents: function (node)
	{
		do
		{
			var ingredient = node['data-ingredient']
			if (ingredient)
				return ingredient
		}
		while ((node = node.parentNode))
		
		return null
	},
	
	maybeIngredientClicked: function (target)
	{
		var ingredient = this.findIngredientInParents(target)
		
		if (ingredient)
			this.controller.ingredientSelected(ingredient)
	},
	
	showIngredient: function (ingredient)
	{
		IngredientPopup.show(ingredient)
	}
}

Object.extend(Me.prototype, myProto)

})();

;(function(){

eval(NodesShortcut.include())

var UrlEncodeLight = {}
Object.extend(UrlEncodeLight, UrlEncode)
UrlEncodeLight.encode = function (v) { return ('' + v).replace('&', '%26') }
UrlEncodeLight.decode = function (v) { return ('' + v).replace('%26', '&') }

function Me ()
{
	this.nodes = {}
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var ff = new FunFix()
		ff.bind(nodes.mainFunFix)
		
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
		
		nodes.searchForm.addEventListener('submit', function (e) { e.preventDefault(); window.setTimeout(function () { me.searchFormSubmitted() }, 50) }, false)
		
		nodes.plusButton.addEventListener('click', function (e) { me.plusButtonClicked() }, false)
		nodes.resetButton.addEventListener('click', function (e) { me.resetButtonClicked() }, false)
		
		var controller = this.controller
		
		var s = this.sortbySelect = new Selecter()
		s.bind(nodes.sortbySelect)
		s.addEventListener('select', function (e) { controller.setSortBy(+e.data.num) }, false)
		
		nodes.ingredientsList.addEventListener('click', function (e) { me.maybeIngredientClicked(e.target) }, false)
		nodes.cocktailList.addEventListener('click', function (e) { me.maybeIngredientClicked(e.target) }, false)
		
		var lh = this.locationHash = new LocationHash().bind()
		lh.addEventListener('change', function (e) { me.locationHashUpdated() }, false)
		
		var t = (function (y) { me.controller.windowScrolled(y) }).throttle(100, 500)
		
		function onscroll (e)
		{
			var y = window.pageYOffset
			
			t(y)
			ff.windowScrolled(y)
		}
		
		window.addEventListener('scroll', onscroll, false)
		
		return this
	},
	
	plusButtonClicked: function ()
	{
		var input = this.nodes.queryInput
		
		this.completer.reset()
		
		var value = input.value
		if (/\S/.test(value))
			input.value = value.replace(/\s*$/, ' + ')
		
		input.focus()
	},
	
	resetButtonClicked: function ()
	{
		var input = this.nodes.queryInput
		
		input.value = ''
		input.focus()
		this.controller.setQuery([], [], '')
	},
	
	locationHashUpdated: function ()
	{
		var bookmark = UrlEncodeLight.parse(this.locationHash.get())
		
		var query = bookmark.q || ''
		
		var parts = QueryParser.getParts(QueryParser.parse(query))
		
		var state =
		{
			add: parts.add,
			remove: parts.remove,
			query: query,
			sortBy: bookmark.s,
			ingredientPopup: bookmark.i,
			scrollTop: bookmark.y
		}
		
		this.controller.setState(state)
	},
	
	renderQuery: function (query)
	{
		this.completer.reset()
		this.nodes.queryInput.value = query
	},
	
	setBookmark: function (state)
	{
		var bookmark =
		{
			q: state.query,
			s: state.sortBy,
			i: state.ingredientPopup,
			y: state.scrollTop
		}
		
		for (var k in bookmark)
		{
			var v = bookmark[k]
			if (!v && v !== 0)
				delete bookmark[k]
		}
		
		this.locationHash.set(UrlEncodeLight.stringify(bookmark))
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
		
		output.classList.remove('initial-state')
		output.classList.remove('result-state')
		output.classList.remove('empty-state')
		
		var inco = this.inco, inli = this.inli
		
		if (!cocktails)
		{
			output.classList.add('initial-state')
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
			output.classList.add('empty-state')
			inco.setCocktails(cocktails)
			return
		}
		
		inco.wake()
		inli.sleep()
		
		output.classList.add('result-state')
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
		s.href = '#q=' + encodeURIComponent(examples[0])
		
		var pair = examples[1].join(' + ')
		d.firstChild.nodeValue = pair
		d.href = '#q=' + encodeURIComponent(pair)
	},
	
	renderSuggestions: function (suggestions)
	{
		var nodes = this.nodes,
			root = nodes.suggestions,
			list = nodes.suggestionsList
		
		list.empty()
		
		if (suggestions.length == 0)
		{
			root.classList.add('empty')
			return
		}
		
		root.classList.remove('empty')
		
		for (var i = 0, il = suggestions.length; i < il; i++)
		{
			var s = suggestions[i]
			
			var item = Nc('li', 'item')
			
			var query = s.add.join(' + ')
			var link = Nct('a', 'link', query)
			link.href= '#q=' + encodeURIComponent(query)
			item.appendChild(link)
			
			item.appendChild(Nct('span', 'count', ' (' + s.count + ' ' + s.count.plural('коктейль', 'коктейля', 'коктейлей') + ')'))
			
			list.appendChild(item)
		}
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
		if (ingredient)
		{
			var popup = IngredientPopup.show(ingredient)
			var controller = this.controller
			popup.onhide = function () { controller.ingredientSelected(null) }
		}
		else
			IngredientPopup.hide()
	},
	
	scrollTo: function (top)
	{
		window.scrollTo(0, top)
	}
}

Papa.View = Me

})();

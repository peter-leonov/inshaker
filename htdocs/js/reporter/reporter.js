<!--# include virtual="/lib-0.3/modules/form-helper.js" -->
<!--# include virtual="/lib-0.3/modules/url-encode.js" -->

;(function(){

var myName = 'Reporter'

function Me ()
{
	this.nodes = {}
}

Me.initialize = function (db)
{
	var cocktails = Cocktail.getAll()
	
	for (var i = 0, il = cocktails.length; i < il; i++)
	{
		var cocktail = cocktails[i]
		
		var stat = db[cocktail.name]
		if (!stat)
		{
			cocktail.stat =
			{
				pageviews: -1,
				uniquePageviews: -1
			}
			continue
		}
		
		cocktail.stat =
		{
			pageviews: stat[0],
			uniquePageviews: stat[1]
		}
	}
	
	var total = db.$total
	Cocktail.totalPageviews = total[0]
	Cocktail.totalUniquePageviews = total[1]
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		function submit (e)
		{
			e.preventDefault()
			me.doCalculate(FormHelper.toHash(this))
		}
		nodes.ingredientForm.addEventListener('submit', submit, false)
		
		
		var ingredientsTags = Ingredient.getTags()
		var ingredientsTagsHash = this.ingredientsTagsHash = {}
		for (var i = 0, il = ingredientsTags.length; i < il; i++)
		{
			var tag = ingredientsTags[i]
			ingredientsTagsHash[tag.toLowerCase()] = tag
		}
	},
	
	doCalculate: function (form)
	{
		this.clear()
		
		var totalCocktails = Cocktail.getAll().length
		
		this.print('Всего просмотров (pageviews) всех коктейлей: ' + Cocktail.totalPageviews)
		this.print('Всего уникальных просмотров (uniquePageviews) всех коктейлей: ' + Cocktail.totalUniquePageviews)
		this.print('Всего коктейлей на сайте: ' + totalCocktails)
		this.print(' ')
		
		var query = form.ingredients.replace(/\s+/g, ' ').replace(/^ | $/g, '')
		query = this.guessQueryType(query)
		
		var ingredientNames
		if (query.type == 'ingredient-tag')
			ingredientNames = query.names
		else if (query.type == 'ingredient')
			ingredientNames = [query.ingredient.name]
		
		var results = []
		for (var i = 0, il = ingredientNames.length; i < il; i++)
		{
			var name = ingredientNames[i]
			var cocktails = Cocktail.getByIngredientNames([name])
			cocktails.sort(function (a, b) { return b.stat.pageviews - a.stat.pageviews })
			results[i] = cocktails
			this.renderCocktails(name, cocktails)
		}
		
		if (results.length > 1)
		{
			
		}
	},
	
	renderCocktails: function (name, cocktails)
	{
		var pageviews = 0,
			uniquePageviews = 0,
			total = 0,
			all = []
		for (var i = 0; i < cocktails.length; i++)
		{
			var cocktail = cocktails[i]
			
			var stat = cocktail.stat
			all.push([cocktail.name, stat.pageviews, stat.uniquePageviews])
			pageviews += stat.pageviews
			uniquePageviews += stat.uniquePageviews
			total++
		}
		
		var totalCocktails = Cocktail.getAll().length
		this.printHead(name)
		this.print('Всего просмотров: ' + pageviews)
		this.print('Всего уникальных просмотров: ' + uniquePageviews)
		this.print('Всего коктейлей: ' + total)
		this.print(' ')
		this.print('Max factor по просмотрам: ' + ((pageviews * totalCocktails) / (total * Cocktail.totalPageviews)).toFixed(2))
		this.print('Max factor по уникальным просмотрам: ' + ((uniquePageviews * totalCocktails) / (total * Cocktail.totalUniquePageviews)).toFixed(2))
		this.print(' ')
		this.printTable(['коктейль', 'pageviews', 'uniquePageviews'], all)
	},
	
	guessQueryType: function (item)
	{
		var tag = this.ingredientsTagsHash[item.toLowerCase()]
		if (tag)
		{
			var names = []
			var group = Ingredient.getByTag(tag)
			for (var j = 0, jl = group.length; j < jl; j++)
				names[j] = group[j].name
			
			return {type: 'ingredient-tag', tag: tag, names: names}
		}
		
		var ingredient = Ingredient.getByNameCI(item)
		if (ingredient)
			return {type: 'ingredient', ingredient: ingredient}
	},
	
	
	
	
	
	
	clear: function ()
	{
		this.nodes.output.empty()
	},
	
	print: function (str)
	{
		if (typeof str === 'object' && typeof str.length === 'number')
			for (var i = 0; i < str.length; i++)
				this.printString(str[i])
		else
			this.printString(str)
	},
	
	printTable: function (head, data)
	{
		var output = this.nodes.output
		
		var table = document.createElement('table')
		var thead = document.createElement('thead')
		
		for (var i = 0; i < head.length; i++)
			thead.appendChild(document.createElement('th')).appendChild(document.createTextNode(head[i]))
		table.appendChild(thead)
		
		for (var i = 0; i < data.length; i++)
		{
			var row = data[i],
				tr = document.createElement('tr')
			for (var j = 0; j < row.length; j++)
				tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(row[j]))
			table.appendChild(tr)
		}
		
		output.appendChild(table)
	},
	
	printString: function (str)
	{
		this.nodes.output.appendChild(document.createElement('li')).appendChild(document.createTextNode(str))
	},
	
	printHead: function (str)
	{
		this.nodes.output.appendChild(document.createElement('hr'))
		this.nodes.output.appendChild(document.createElement('h1')).appendChild(document.createTextNode(str))
	},
	
	error: function (str)
	{
		var li = this.nodes.output.appendChild(document.createElement('li'))
		li.className = 'error'
		li.appendChild(document.createTextNode(str))
	}
}

Me.className = myName
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/stats/views.json" -->)

})();

function onready ()
{
	var nodes =
	{
		html: document.documentElement,
		main: $$('#analytics')[0],
		ingredientForm: $$('#analytics #ingredient-search')[0],
		output: $$('#analytics #output')[0],
		query: $$('#analytics #query')[0]
	}
	
	new Reporter().bind(nodes)
}
$.onready(onready)
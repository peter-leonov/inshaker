;(function(){

function byPageview (a, b) { return b.pageviews - a.pageviews }

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
		
		var query = form.ingredients.replace(/\s+/g, ' ').replace(/^ | $/g, '')
		query = this.guessQueryType(query)
		
		if (!query)
		{
			this.print('фигня какая-то…')
			return
		}
		
		var totalCocktails = Cocktail.getAll().length
		
		this.print('Всего просмотров (pageviews) всех коктейлей: ' + Cocktail.totalPageviews)
		this.print('Всего уникальных просмотров (uniquePageviews) всех коктейлей: ' + Cocktail.totalUniquePageviews)
		this.print('Всего коктейлей на сайте: ' + totalCocktails)
		this.print(' ')
		
		if (query.type == 'cocktail')
		{
			this.processCocktail(query.cocktail)
			return
		}
		
		if (query.type == 'cocktail-tag')
		{
			this.processCocktailTag(query.tag, query.cocktails)
			return
		}
		
		if (query.type == 'ingredient')
		{
			this.processIngredient(query.ingredient.name)
			return
		}
		
		if (query.type == 'ingredient-tag')
		{
			this.processIngredientTag(query.tag, query.names)
			return
		}
	},
	
	processCocktail: function (cocktail)
	{
		this.renderStats(cocktail.name, [{name: cocktail.name, pageviews: cocktail.stat.pageviews, uniquePageviews: cocktail.stat.uniquePageviews}])
	},
	
	processCocktailTag: function (tag, cocktails)
	{
		var stats = []
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			stats[i] = {name: cocktail.name, pageviews: cocktail.stat.pageviews, uniquePageviews: cocktail.stat.uniquePageviews}
		}
		
		stats.sort(byPageview)
		this.renderStats(tag, stats)
	},
	
	processIngredient: function (name)
	{
		var cocktails = Cocktail.getByIngredientNames([name])
		var stats = []
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			stats[i] = {name: cocktail.name, pageviews: cocktail.stat.pageviews, uniquePageviews: cocktail.stat.uniquePageviews}
		}
		
		stats.sort(byPageview)
		this.renderStats(name, stats)
		
		return stats
	},
	
	processIngredientTag: function (tag, names)
	{
		var results = []
		for (var i = 0, il = names.length; i < il; i++)
		{
			var name = names[i]
			results[i] = this.processIngredient(name)
		}
		
		if (results.length > 1)
		{
			var seen = {}
			for (var i = 0, il = results.length; i < il; i++)
			{
				var stats = results[i]
				for (var j = 0, jl = stats.length; j < jl; j++)
				{
					var stat = stats[j]
					
					var seenStat = seen[stat.name]
					if (seenStat)
					{
						seenStat.pageviews += stat.pageviews
						seenStat.uniquePageviews += stat.uniquePageviews
						continue
					}
					
					seen[stat.name] =
					{
						name: stat.name,
						pageviews: stat.pageviews,
						uniquePageviews: stat.uniquePageviews
					}
				}
			}
			
			var stats = Object.values(seen)
			stats.sort(byPageview)
			this.renderStats('Сводная по тегу «' + tag + '»', stats)
		}
	},
	
	renderStats: function (name, stats)
	{
		var pageviews = 0,
			uniquePageviews = 0,
			all = []
		for (var i = 0; i < stats.length; i++)
		{
			var stat = stats[i]
			all.push([stat.name, stat.pageviews, stat.uniquePageviews])
			pageviews += stat.pageviews
			uniquePageviews += stat.uniquePageviews
		}
		
		var total = stats.length
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
		
		var tag = Cocktail.getTagByTagCI(item)
		if (tag)
			return {type: 'cocktail-tag', tag: tag, cocktails: Cocktail.getByTag(tag)}
		
		var cocktail = Cocktail.getByNameCI(item)
		if (cocktail)
			return {type: 'cocktail', cocktail: cocktail}
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

Me.initialize(<!--# include virtual="/db/stats/last-30-days.json" -->)

})();

<!--# include virtual="/lib-0.3/modules/form-helper.js" -->
<!--# include virtual="/lib-0.3/modules/url-encode.js" -->

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
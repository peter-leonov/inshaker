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
	},
	
	doCalculate: function (form)
	{
		if (!form.ingredients)
			return
		
		var cocktails = Cocktail.getByIngredientNames(form.ingredients.split(/\s*,\s*/)),
			totalCocktails = Cocktail.getAll().length,
			output = this.nodes.output
		
		cocktails.sort(function (a, b) { return b.stat.pageviews - a.stat.pageviews })
		
		this.clear()
		
		var pageviews = 0, uniquePageviews = 0, total = 0, all = []
		for (var i = 0; i < cocktails.length; i++)
		{
			var cocktail = cocktails[i]
			
			var stat = cocktail.stat
			all.push([cocktail.name, stat.pageviews, stat.uniquePageviews])
			pageviews += stat.pageviews
			uniquePageviews += stat.uniquePageviews
			total++
		}
		
		
		// this.print('Всего просмотров (pageviews) всех коктейлей: ' + stats.total.pageviews)
		// this.print('Всего уникальных просмотров (uniquePageviews) всех коктейлей: ' + stats.total.uniquePageviews)
		this.print('Всего коктейлей на сайте: ' + totalCocktails)
		this.print(' ')
		this.print('Всего просмотров (pageviews) ингрединта: ' + pageviews)
		this.print('Всего уникальных (uniquePageviews) просмотров ингрединта: ' + uniquePageviews)
		this.print('Всего коктейлей с ингредиентом: ' + total)
		this.print(' ')
		// this.print('Коэффициент Макса по просмотрам: ' + ((pageviews * totalCocktails) / (total * stats.total.pageviews)).toFixed(2))
		// this.print('Коэффициент Макса по уникальным просмотрам: ' + ((uniquePageviews * totalCocktails) / (total * stats.total.uniquePageviews)).toFixed(2))
		this.print(' ')
		this.printTable(['коктейль', 'pageviews', 'uniquePageviews'], all)
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
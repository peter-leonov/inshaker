<!--# include file="/lib/Programica/Form.js" -->
<!--# include file="/js/common/class.js" -->
<!--# include file="/js/common/url-encode.js" -->
$$ = cssQuery
Element.prototype.removeClassName = Element.prototype.remClassName

;(function(){

var myName = 'Analytics',
	Me = self[myName] = Class(myName)

// Me.mixIn(EventDriven)
// eval(NodesShortcut())

Me.prototype.extend
({
	initialize: function ()
	{
		this.nodes = {}
		this.scope = 'https://www.google.com/analytics/feeds'
	},

	bind: function (nodes, conf)
	{
		this.nodes = nodes
		this.conf = conf
		
		var me = this
		nodes.login.addEventListener('click', function (e) { me.doLogin() }, false)
		nodes.logout.addEventListener('click', function (e) { me.doLogout() }, false)
		nodes.ingredientForm.addEventListener('submit', function (e) { e.preventDefault(); me.doCalculate(e.target.toHash()) }, false)
		nodes.rangeForm.addEventListener('submit', function (e) { e.preventDefault(); me.doRange(e.target.toHash()) }, false)
		
		this.handleErrorCallback = function (err) { me.handleError(err) }
		this.handleAccountFeedCallback = function (r) { me.handleAccountFeed(r) }
		return this
	},
	
	handleError: function (err)
	{
		alert(err)
	},
	
	apiLoaded: function (api)
	{
		this.nodes.html.removeClassName('loading')
		
		this.api = api
		var service = this.service = new api.gdata.analytics.AnalyticsService('gaExportAPI_acctSample_v1.0');
		
		if (api.accounts.user.checkLogin(this.scope))
			this.nodes.main.addClassName('logged-in')
	},
	
	doLogin: function ()
	{
		this.api.accounts.user.login(this.scope)
	},
	
	doLogout: function ()
	{
		this.api.accounts.user.logout()
		location.href = location.href
	},
	
	loadData: function (begin, end)
	{
		var me = this, service = this.service, main = this.nodes.main
		
		main.addClassName('loading-data')
		this.service.getAccountFeed('https://www.google.com/analytics/feeds/accounts/default?max-results=50', handleAccounts, this.handleErrorCallback)
		function handleAccounts (result)
		{
			var entries = result.feed.getEntries(),
				id = me.conf.id
			
			CHECK:
			{
				for (var i = 0, entry; entry = entries[i]; i++)
					if (id == entry.getPropertyValue('ga:ProfileId'))
						break CHECK
				
				alert('Нету у вас Иншейкера в гуглоаналитиксе.')
			}
			
			var uri = 'https://www.google.com/analytics/feeds/data',
				query =
				{
					'start-date': begin,
					'end-date': end,
					'dimensions': 'ga:pagePath',
					'metrics': 'ga:pageviews,ga:uniquePageviews',
					'filters': 'ga:pagePath=@/cocktail/,ga:pagePath=@/cocktails/',
					// 'sort':'-ga:pageviews',
					'max-results': 2000,
					'ids': 'ga:' + id
				}
			
			me.service.getDataFeed(uri + '?' + UrlEncode.stringify(query), handleData, me.handleErrorCallback)
		}
		
		var substitute =
		{
			'/cocktails/---_on_the_beach.html': '/cocktails/bitch_on_the_beach.html',
			'Inshaker — ---- на пляже': 'Inshaker — Сука на пляже',
			'/cocktails/safe_---_on_the_beach.html': '/cocktails/safe_sex_on_the_beach.html',
			'Inshaker — Безопасный ---- на пляже': 'Inshaker — Безопасный секс на пляже',
			'/cocktails/---_on_the_beach_light.html': '/cocktails/sex_on_the_beach_light.html',
			'Inshaker — ---- на пляже лайт': 'Inshaker — Секс на пляже лайт',
			'Inshaker — Ангельские ------': 'Inshaker — Ангельские сиськи'
		}
		
		function uncensor (value)
		{
			if (value.indexOf('---') >= 0)
				if (substitute[value])
					value = substitute[value]
				else
					alert('Изуродовано цензурой: ' + value)
			return value
		}
		
		google.gdata.analytics.DataEntry.prototype.getStringValueOf = function (name)
		{
			return uncensor(this.getValueOf(name)) || '(empty)'
		}
		
		google.gdata.analytics.DataEntry.prototype.getNumberValueOf = function (name)
		{
			return +(this.getValueOf(name) || 0)
		}
		
		google.gdata.analytics.DataFeed.prototype.getAggregatesAsEntry = function ()
		{
			var metrics = this.getAggregates().getMetrics(),
				entry = new google.gdata.analytics.DataEntry()
			for (var i = 0; i < metrics.length; i++)
				entry.addMetric(metrics[i])
			return entry
		}
		
		
		function handleData (result)
		{
			var entries = result.feed.getEntries(),
				total = result.feed.getAggregatesAsEntry(),
				stats = me.stats = {}
			
			stats.total =
			{
				pageviews: total.getNumberValueOf('ga:pageviews'),
				uniquePageviews: total.getNumberValueOf('ga:uniquePageviews')
			}
			
			for (var i = 0, entry; entry = entries[i]; i++)
			{
				var path = entry.getStringValueOf('ga:pagePath'),
					m = /^\/cocktails\/(.+?)\.html|\/cocktail\/(.+?)\/$/.exec(path)
				
				if (m)
				{
					var name = m[1] || m[2], stat
					
					if (!(stat = stats[name]))
					 	stat = stats[name] = {pageviews: 0, uniquePageviews: 0}
					
					stat.pageviews += entry.getNumberValueOf('ga:pageviews')
					stat.uniquePageviews += entry.getNumberValueOf('ga:uniquePageviews')
				}
				else
					me.error('Can`t parse cocktail name out of path "' + path + '"')
			}
			
			main.removeClassName('loading-data')
			me.dataReady()
		}
	},
	
	dataReady: function ()
	{
		this.nodes.query.removeClassName('loading')
		this.doCalculate(this.nodes.ingredientForm.toHash())
	},
	
	doRange: function (form)
	{
		this.loadData(form.begin, form.end)
	},
	
	doCalculate: function (form)
	{
		if (!form.ingredients)
			return
		
		var cocktails = Cocktail.getByIngredients(form.ingredients.split(/\s*,\s*/)),
			totalCocktails = Cocktail.getAll().length,
			stats = this.stats, output = this.nodes.output
		
		for (var i = 0; i < cocktails.length; i++)
		{
			var cocktail = cocktails[i]
			cocktail.stat = stats[cocktail.name_eng.htmlName()]
		}
		
		cocktails.sort(function (a, b) { return String.localeCompare(a.name, b.name) })
		
		this.clear()
		var pageviews = 0, uniquePageviews = 0, total = 0, all = []
		for (var i = 0; i < cocktails.length; i++)
		{
			var cocktail = cocktails[i], stat = cocktail.stat
			if (stat)
			{
				all.push([cocktail.name, stat.pageviews, stat.uniquePageviews])
				pageviews += stat.pageviews
				uniquePageviews += stat.uniquePageviews
				total++
			}
			else
				this.error('Нет статистики для ' + cocktail.name + ', коктейль не защитан')
		}
		
		
		this.print('Всего просмотров (pageviews) всех коктейлей: ' + stats.total.pageviews)
		this.print('Всего уникальных просмотров (uniquePageviews) всех коктейлей: ' + stats.total.uniquePageviews)
		this.print('Всего коктейлей на сайте: ' + totalCocktails)
		this.print(' ')
		this.print('Всего просмотров (pageviews) ингрединта: ' + pageviews)
		this.print('Всего уникальных (uniquePageviews) просмотров ингрединта: ' + uniquePageviews)
		this.print('Всего коктейлей с ингредиентом: ' + total)
		this.print(' ')
		this.print('Коэффициент Макса по просмотрам: ' + ((pageviews * totalCocktails) / (total * stats.total.pageviews)).toFixed(2))
		this.print('Коэффициент Макса по уникальным просмотрам: ' + ((uniquePageviews * totalCocktails) / (total * stats.total.uniquePageviews)).toFixed(2))
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
})

})();

function onready ()
{
	var nodes =
	{
		html: document.documentElement,
		main: $$('#analytics')[0],
		login: $$('#analytics #login')[0],
		logout: $$('#analytics #logout')[0],
		rangeForm: $$('#analytics #range')[0],
		ingredientForm: $$('#analytics #ingredient-search')[0],
		output: $$('#analytics #output')[0],
		query: $$('#analytics #query')[0]
	}
	
	var conf =
	{
		id: 9038802
	}
	
	var an = new Analytics().bind(nodes, conf)
	google.load('gdata', '1.x', {packages: ['analytics'], callback: function () { an.apiLoaded(google) }})
	// an.pageviews = <!-- include file="anal.js" -->
	// an.dataReady()
}
$.onready(onready)
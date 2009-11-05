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
		this.pageviews = {}
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
		
		this.handleErrorCallback = function (err) { me.handleError(err) }
		this.handleAccountFeedCallback = function (r) { me.handleAccountFeed(r) }
		return this
	},
	
	handleError: function (err)
	{
		log(err)
	},
	
	apiLoaded: function (api)
	{
		this.nodes.html.removeClassName('loading')
		
		this.api = api
		var service = this.service = new api.gdata.analytics.AnalyticsService('gaExportAPI_acctSample_v1.0');
		
		if (api.accounts.user.checkLogin(this.scope))
		{
			this.nodes.main.addClassName('logged-in')
			this.loadData()
		}
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
	
	loadData: function ()
	{
		var me = this, service = this.service
		
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
					'start-date': '2009-10-01',
					'end-date': '2009-10-31',
					'dimensions': 'ga:pagePath,ga:pageTitle',
					'metrics': 'ga:pageviews',
					'filters': 'ga:pagePath=@/cocktails/',
					// 'sort':'-ga:pageviews',
					'max-results': 2000,
					'ids': 'ga:' + id
				}
			
			me.service.getAccountFeed(uri + '?' + UrlEncode.stringify(query), handleData, me.handleErrorCallback)
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
		
		function dxpToHash (dxp, hash)
		{
			for (var i = 0; i < dxp.length; i++)
				if ((pair = dxp[i]))
				{
					var value = pair.value
					if (value.indexOf('---') >= 0)
						if (substitute[value])
							value = substitute[value]
						else
							alert('Изуродовано цензурой: ' + pair.value)
					hash[pair.name] = value
				}
		}
		
		function handleData (result)
		{
			var entries = result.feed.getEntries(),
				pageviews = me.pageviews
			
			for (var i = 0, entry; entry = entries[i]; i++)
			{
				// log(entry)
				var hash = {}, data, pair
				dxpToHash(entry.dxp$dimension, hash)
				dxpToHash(entry.dxp$metric, hash)
				
				// log(hash)
				
				var path = hash['ga:pagePath']
				pageviews[path] = {path: path, title: hash['ga:pageTitle'], views: hash['ga:pageviews']}
			}
			
			// log(Object.stringify(pageviews))
			me.dataReady()
		}
	},
	
	dataReady: function ()
	{
		this.nodes.query.removeClassName('loading')
	},
	
	doCalculate: function (form)
	{
		var cocktails = Cocktail.getByIngredients(form.ingredients.split(/\s*,\s*/)),
			pageviews = this.pageviews, output = this.nodes.output
		
		for (var i = 0; i < cocktails.length; i++)
		{
			var cocktail = cocktails[i],
				uri = '/cocktails/' + cocktail.name_eng.htmlName() + '.html',
				data = pageviews[uri]
			
			if (!data)
			{
				this.error('Нет статистики для ' + cocktail.name + ', по адресу ' + uri)
				cocktail.views = 0
			}
			else
			{
				cocktail.views = data.views
			}
		}
		
		cocktails.sort(function (a, b) { return b.views - a.views })
		
		this.clear()
		var views = 0, total = 0, all = []
		for (var i = 0; i < cocktails.length; i++)
		{
			var cocktail = cocktails[i]
			all.push(cocktail.name + ' — ' + cocktail.views)
			views += +data.views
			total++
		}
		
		this.print('Всего просмотров: ' + views)
		this.print('Всего коктейлей: ' + total)
		this.print('Коэфициент Макса: ' + (views / 1000 / total).toFixed(2))
		this.print(' ')
		this.print(all)
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
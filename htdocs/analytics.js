<!--# include file="/js/common/class.js" -->
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

	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		nodes.login.addEventListener('click', function (e) { me.doLogin() }, false)
		nodes.logout.addEventListener('click', function (e) { me.doLogout() }, false)
		nodes.calculate.addEventListener('click', function (e) { me.doCalculate() }, false)
		
		return this
	},
	
	apiLoaded: function (api)
	{
		this.api = api
		var service = this.service = new api.gdata.analytics.AnalyticsService('gaExportAPI_acctSample_v1.0');
		
		if (api.accounts.user.checkLogin(this.scope))
			this.nodes.main.addClassName('logged-in')
		
		this.nodes.html.removeClassName('loading')
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
	
	doCalculate: function ()
	{
		log(123)
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
		calculate: $$('#analytics #calculate')[0]
	}
	
	var an = new Analytics().bind(nodes)
	google.load('gdata', '1.x', {packages: ['analytics'], callback: function () { an.apiLoaded(google) }})
}
$.onready(onready)
;(function(){

var myName = 'GoogleApiLoader'

function Me (key, language)
{
	this.state = 'init'
	this.key = key
	this.apis = []
	this.language = language || (self.LanguagePack ? LanguagePack.code : 'en')
	this.prerequisites = {}
}

Me.prototype =
{
	load: function (name, version, opts)
	{
		if (name)
			this.apis.push({name: name, version: version, opts: opts || {}})
		
		var me = this
		
		if (this.state == 'init')
		{
			this.node = $.load('http://www.google.com/jsapi')
			
			function wait ()
			{
				if (!window.google)
					return
				
				window.clearInterval(timer)
				me.apiLoaderLoaded()
			}
			
			var timer = window.setInterval(wait, 250)
			
			this.state = 'loading'
		}
		
		if (this.state == 'ready')
			window.setTimeout(function () { me.fireAll() }, 1)
			
		return this
	},
	
	apiLoaderLoaded: function ()
	{
		this.state = 'ready'
		this.apiLoaded({name: 'loader'}, window.google['loader'])
		
		this.fireAll()
	},
	
	fireAll: function ()
	{
		for (var i = 0; i < this.apis.length; i++)
			this.loadApi(this.apis[i])
		
		this.apis.length = 0
	},
	
	loadApi: function (api)
	{
		var me = this
		function callback (e)
		{
			me.apiLoaded(api)
		}
		
		var opts = api.opts
		opts.nocss = true
		opts.language = this.language
		opts.callback = callback
		
		window.google.load(api.name, api.version, opts)
	},
	
	apiLoaded: function (api)
	{
		this.dispatchEvent({type: api.name, api: window.google[api.name]})
	}
}

Me.mixIn(EventDriven)

Me.className = myName
self[myName] = Me

})();

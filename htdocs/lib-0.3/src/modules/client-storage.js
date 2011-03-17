;(function(){

var Papa

;(function(){

function Me ()
{
	this.state = 'init'
	this.listeners = []
}

Me.prototype =
{
	ready: function (f)
	{
		var state = this.state
		
		if (state == 'ready')
		{
			setTimeout(f, 0)
			return
		}
		
		this.listeners.push(f)
		
		if (state == 'init')
			this.bind()
	},
	
	bind: function (e)
	{
		this.onready()
	},
	
	onready: function ()
	{
		this.state = 'ready'
		
		var listeners = this.listeners
		for (var i = 0; i < listeners.length; i++)
			setTimeout(listeners[i], 0)
		
		this.listeners.length = 0
	}
}

Me.staticMethods =
{
	backends: [],
	addBackend: function (o)
	{
		this.backends.push(o)
	},
	
	guess: function ()
	{
		// try to init one backend by one
		for (var i = 0; i < this.backends.length; i++)
		{
			var backend = new this.backends[i]
			if (backend.init())
				return this.backend = backend
		}
	}
}

Object.extend(Me, Me.staticMethods)

Me.className = 'ClientStorage'
self[Me.className] = Me
Papa = Me

})();


;(function(){

function Me ()
{
	Papa.call(this)
}

Me.prototype = new Papa()

Me.methods =
{
	init: function ()
	{
		return this.data = window.localStorage
	},
	
	get: function (k)
	{
		// https://bugs.webkit.org/show_bug.cgi?id=30996
		// to not to interfere with data method names
		k = 'x' + k
		return this.data.getItem(k)
	},
	set: function (k, v)
	{
		k = 'x' + k
		this.data.setItem(k, v)
		return v
	},
	remove: function (k)
	{
		k = 'x' + k
		var data = this.data
		
		var v = data.getItem(k)
		data.removeItem(k)
		return v
	},
	length: function ()
	{
		return this.data.length
	},
	keys: function ()
	{
		var data = this.data
		
		var keys = []
		for (var i = 0, il = data.length; i < il; i++)
			keys[i] = data.key(i).substr(1)
		
		return keys
	},
	clear: function ()
	{
		var keys = this.keys()
		this.data.clear()
		return keys
	}
}

Object.extend(Me.prototype, Me.methods)

Me.className = 'LocalStorage'
Papa[Me.className] = Me

Papa.addBackend(Me)

})();


;(function(){

function Me ()
{
	Papa.call(this)
}

Me.prototype = new Papa.LocalStorage()

Me.methods =
{
	init: function ()
	{
		var data = window.globalStorage
		return this.data = data && data[location.hostname]
	},
	
	get: function (k)
	{
		k = 'x' + k
		var v = this.data.getItem(k)
		return v === null ? null : v.value
	},
	remove: function (k)
	{
		k = 'x' + k
		var data = this.data
		
		var v = data.getItem(k)
		if (v !== null)
			v = v.value
		data.removeItem(k)
		return v
	},
	clear: function ()
	{
		var data = this.data
		
		var keys = []
		for (var i = 0, il = data.length; i < il; i++)
		{
			// get the first key at every iteration
			var k = data.key(0)
			keys[i] = k.substr(1)
			data.removeItem(k)
		}
		return keys
	}
}

Object.extend(Me.prototype, Me.methods)

Me.className = 'GlobalStorage'
Papa[Me.className] = Me

Papa.addBackend(Me)

})();


;(function(){

function Me ()
{
	Papa.call(this)
}

Me.prototype = new Papa()

Me.methods =
{
	init: function ()
	{
		return !!document.body.addBehavior
	},
	
	bind: function ()
	{
		var iframe = document.createElement('iframe')
		document.getElementsByTagName('head')[0].appendChild(iframe)
		iframe.src = '/favicon.ico'
		
		var me = this
		iframe.onreadystatechange = function ()
		{
			if (iframe.readyState != 'complete')
				return
			
			me.node = iframe.contentWindow.document.body
			me.node.addBehavior("#default#userData")
			
			me.onready()
		}
	},
	
	load: function ()
	{
		var node = this.node
		node.load('client-storage')
		return node.XMLDocument.documentElement
	},
	
	save: function ()
	{
		this.node.save('client-storage')
	},
	
	get: function (k)
	{
		return this.load().getAttribute('x' + k)
	},
	
	set: function (k, v)
	{
		this.load().setAttribute('x' + k, v)
		this.save()
		return v
	},
	
	remove: function (k)
	{
		k = 'x' + k
		var data = this.load()
		
		var v = data.getAttribute(k)
		data.removeAttribute(k)
		this.save()
		return v
	},
	
	length: function ()
	{
		return this.load().attributes.length
	},
	
	keys: function ()
	{
		var keys = []
		
		var attributes = this.load().attributes
		for (var i = 0, il = attributes.length; i < il; i++)
			keys[i] = attributes[i].name.substr(1)
		
		return keys
	},
	
	clear: function (k)
	{
		var keys = []
		
		var data = this.load(), attributes = data.attributes
		for (var i = 0, il = attributes.length; i < il; i++)
		{
			// get the first key at every iteration
			var name = attributes[0].name
			keys[i] = name.substr(1)
			
			data.removeAttribute(name)
		}
		
		this.save()
		
		return keys
	}
}

Object.extend(Me.prototype, Me.methods)

Me.className = 'UserData'
Papa[Me.className] = Me

Papa.addBackend(Me)

})();


})();
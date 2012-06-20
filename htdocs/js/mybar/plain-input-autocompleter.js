;(function(){

var myName = 'PlainInputAutocompleter'

function Me ()
{
	this.nodes = {}
	this.constructor = Me
}

Me.prototype =
{
	// ignore “non-content” keycodes
	suppressKeys: {9:1, 13:1, 16:1, 17:1, 27:1, 33:1, 34:1, 35:1, 36:1, 37:1, 38:1, 39:1, 18:1, 91:1},
	actionKeys: {40:'down'},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var completer = this.completer = new Autocompleter()
		completer.bind(nodes)
		
		completer.addEventListener('accept', function (e) { me.accept(e.value, e.source) }, false)
		completer.addEventListener('select', function (e) { me.select(e.value, e.source) }, false)
		
		var me = this
		nodes.main.addEventListener('keypress', function (e) { me.onKeyPress(e) }, false)
		nodes.main.addEventListener('blur', function (e) { me.onBlur() }, false)
		
		return this
	},
	
	onKeyPress: function (e)
	{
		var keyCode = e.keyCode
		// log(keyCode)
		
		if (this.suppressKeys[keyCode])
			return
		
		var action = this.actionKeys[keyCode]
		if (action)
		{
			e.preventDefault()
			e.stopPropagation()
		}
		
		var me = this
		window.setTimeout(function () { me.action(action) }, 1)
	},
	
	onBlur: function ()
	{
		this.completer.reset()
	},
	
	action: function (action)
	{
		var v = this.nodes.main.value,
			completer = this.completer
		
		if (v === '')
			return completer.reset()
		
		if (action)
			return this[action](v)
		
		completer.search(v)
	},
	
	down: function (v)
	{
		this.completer.search(v)
	},
	
	select: function (value, source)
	{
		this.nodes.main.value = value != null ? value : source
	},
	
	accept: function (value, source)
	{
		this.select(value || '', source)
		this.dispatchEvent({type: 'accept', source: source, value: value})
	},
	
	setDataSource: function (ds)
	{
		return this.completer.setDataSource(ds)
	}
}

Me.mixIn(EventDriven)
Me.className = myName
self[myName] = Me

})();
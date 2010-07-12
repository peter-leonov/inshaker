;(function(){

var myName = 'PlainInputAutocompleter'

function Me ()
{
	this.nodes = {}
	this.constructor = Me
}

// eval(NodesShortcut.include())

Me.prototype =
{
	keyMap: {38:false, 40:'down', 37:false, 39:false, 9:false, 16:false, 17:false, 18:false, 91:false, 13:false, 27:false},
	
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
		// alert(e.keyCode)
		var action = this.keyMap[e.keyCode]
		
		// ignore “non-content” keycodes
		if (action === false)
			return
		
		if (action)
		{
			e.preventDefault()
			e.stopPropagation()
		}
		
		var me = this
		setTimeout(function () { me.action(action) }, 1)
	},
	
	onBlur: function ()
	{
		this.completer.reset()
	},
	
	action: function (action)
	{
		var v = this.nodes.main.value,
			completer = this.completer
		
		if (action)
			return this[action](v)
		
		if (v === '')
			completer.reset()
		else
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
		this.select(value, source)
	},
	
	setDataSource: function (ds)
	{
		return this.completer.setDataSource(ds)
	},
}

// Me.mixIn(EventDriven)
Me.className = myName
self[myName] = Me

})();
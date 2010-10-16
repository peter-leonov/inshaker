;(function(){

var myName = 'AddingInputAutocompleter'

function Me ()
{
	this.nodes = {}
	this.constructor = Me
}

Me.prototype =
{
	// ignore “non-content” keycodes
	ignoreKeys: {9:1, 16:1, 17:1, 27:1, 33:1, 34:1, 35:1, 36:1, 38:1, 18:1, 91:1},
	preventKeys: {40:1},
	actionKeys: {37:'cursor', 39:'cursor', 40:'search', 13:'apply'},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var completer = this.completer = new Autocompleter()
		completer.bind(nodes)
		
		completer.addEventListener('accept', function (e) { me.accept(e.value) }, false)
		completer.addEventListener('select', function (e) { me.select(e.value) }, false)
		
		var me = this
		function onupdate (e) { me.onUpdate(e) }
		nodes.main.addEventListener('keypress', onupdate, false)
		nodes.main.addEventListener('click', onupdate, false)
		nodes.main.addEventListener('blur', function (e) { me.onBlur() }, false)
		
		this.updateTokens(nodes.main.value, nodes.main.selectionEnd)
		
		return this
	},
	
	search: function (v, cursor)
	{
		this.updateTokens(v, cursor)
		
		var parts = this.getParts(true)
		this.dispatchEvent({type: 'changed', add: parts.add, remove: parts.remove})
		
		if (!this.tokens.active)
			return
		
		var value = this.tokens.active.value
		if (value === '')
			return this.reset()
		
		this.completer.search(value)
	},
	
	reset: function ()
	{
		this.completer.reset()
	},
	
	onUpdate: function (e)
	{
		var keyCode = e.keyCode
		// log(keyCode)
		
		if (this.ignoreKeys[keyCode])
			return
		
		if (this.preventKeys[keyCode])
		{
			e.preventDefault()
			e.stopPropagation()
		}
		
		var action = this.actionKeys[keyCode]
		
		var me = this
		setTimeout(function () { me.action(action) }, 1)
	},
	
	onBlur: function ()
	{
		this.reset()
	},
	
	action: function (action)
	{
		var main = this.nodes.main,
			v = main.value,
			cursor = main.selectionEnd
		
		if (action)
			return this[action](v, cursor)
		
		this.search(v, cursor)
	},
	
	cursor: function (v, cursor)
	{
		var tokens = this.tokens
		
		var active = tokens.active
		this.updateTokens(v, cursor)
		if (active != tokens.active)
			this.reset()
	},
	
	apply: function (value)
	{
		var parts = this.getParts()
		this.completer.reset()
		this.dispatchEvent({type: 'accept', value: value, add: parts.add, remove: parts.remove})
	},
	
	select: function (value)
	{
		var tokens = this.tokens,
			input = this.nodes.main
		
		tokens.active.value = value
		input.value = QueryParser.stringify(tokens).substr(1)
		input.selectionStart = input.selectionEnd = tokens.active.begin + tokens.active.before.length + value.length - 1
	},
	
	accept: function (value)
	{
		this.select(value)
		
		var parts = this.getParts()
		this.dispatchEvent({type: 'accept', value: value, add: parts.add, remove: parts.remove})
	},
	
	set: function (value)
	{
		var input = this.nodes.main
		input.value = value
		this.updateTokens(value, value.length)
		this.apply()
	},
	
	updateTokens: function (value, cursor)
	{
		// prepare for clean parsing
		value = '+' + value
		cursor++
		
		var tokens
		if (this.lastValue === value)
		{
			tokens = this.tokens
		}
		else
		{
			tokens = this.tokens = QueryParser.parse(value)
			this.lastValue = value
		}
		
		if (this.lastCursor === cursor)
			return
		this.lastCursor = cursor
		
		var active = -1
		for (var i = 0, il = tokens.length; i < il; i++)
		{
			var t = tokens[i]
			
			if (t.begin <= cursor && cursor <= t.end)
				active = i
		}
		
		tokens.active = tokens[active]
	},
	
	getParts: function (exceptActive)
	{
		return QueryParser.getParts(this.tokens, {exceptActive: exceptActive})
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
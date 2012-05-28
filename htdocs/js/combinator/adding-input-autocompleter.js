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
	ignoreKeys: {9:1, 16:1, 17:1, 27:1, 33:1, 34:1, 35:1, 36:1, 38:1, 18:1, 91:1, 13:1},
	preventKeys: {40:1},
	actionKeys: {37:'cursor', 39:'cursor', 40:'search'},
	
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
		nodes.main.addEventListener('blur', function (e) { me.onBlur() }, false)
		
		this.tokenizer = new Tokenizer(nodes.main)
		this.lastCurrentTokenNum = this.tokenizer.getCurrentNum()
		
		return this
	},
	
	search: function ()
	{
		var tokenizer = this.tokenizer
		
		var parts = tokenizer.getParts(true)
		this.dispatchEvent({type: 'changed', add: parts.add, remove: parts.remove})
		
		this.lastCurrentTokenNum = this.tokenizer.getCurrentNum()
		
		var value = tokenizer.getCurrentValue()
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
		window.setTimeout(function () { me.action(action) }, 1)
	},
	
	onBlur: function ()
	{
		this.reset()
	},
	
	action: function (action)
	{
		if (action)
			return this[action]()
		
		this.search()
	},
	
	cursor: function ()
	{
		var num = this.tokenizer.getCurrentNum()
		
		if (num != this.lastCurrentTokenNum)
		{
			this.lastCurrentTokenNum = num
			this.reset()
		}
	},
	
	apply: function (value)
	{
		var parts = this.tokenizer.getParts()
		this.completer.reset()
		this.dispatchEvent({type: 'accept', add: parts.add, remove: parts.remove})
	},
	
	select: function (value)
	{
		this.tokenizer.setCurrentValue(value)
	},
	
	accept: function (value)
	{
		this.select(value)
		
		var parts = this.tokenizer.getParts()
		this.dispatchEvent({type: 'accept', value: value, add: parts.add, remove: parts.remove})
	},
	
	set: function (value)
	{
		var input = this.nodes.main
		input.value = value
		this.apply()
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
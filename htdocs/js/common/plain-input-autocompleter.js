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
	keyMap: {38:'prev', 40:'next', 37:false, 39:false, 9:false, 16:false, 17:false, 18:false, 91:false, 13:false, 27:false},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var completer = this.completer = new Autocompleter()
		completer.bind(nodes)
		
		completer.addEventListener('accept', function (e) { log('accept', e.value) }, false)
		completer.addEventListener('select', function (e) { log('select', e.value) }, false)
		
		var me = this
		nodes.main.addEventListener('keypress', function (e) { me.onKeyPress(e) }, false)
		nodes.main.addEventListener('blur', function (e) { me.onBlur() }, false)
		
		return this
	},
	
	onKeyPress: function (e)
	{
		// alert(e.keyCode)
		var action = this.keyMap[e.keyCode]
		
		if (action === false)
			return
		
		if (action)
		{
			e.preventDefault()
			e.stopPropagation()
		}
		
		var me = this
		setTimeout(function () { me.onAction(action) }, 1)
	},
	
	onBlur: function ()
	{
		this.completer.reset()
	},
	
	onAction: function (action)
	{
		var v = this.nodes.main.value,
			controller = this.completer.controller
		
		if (action)
			controller[action]()
		else
		{
			if (v === '')
				this.completer.reset()
			else
				controller.search(v)
		}
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
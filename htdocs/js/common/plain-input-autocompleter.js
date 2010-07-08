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
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var completer = this.completer = new Autocompleter()
		completer.bind(nodes)
		
		completer.addEventListener('accept', function (e) { log('accept', e.value) }, false)
		completer.addEventListener('select', function (e) { log('select', e.value) }, false)
		
		
		return this
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
;(function(){

var myName = 'Popup'

function Me ()
{
	this.nodes = {}
	this.listeners = {}
	this.constructor = Me
}

// eval(NodesShortcut())

Me.prototype =
{
	visible: false,
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		this.listeners.click = function (e) { me.hide() }
		this.listeners.key = function (e) { e.keyCode == 27 && me.hide() }
		
		nodes.window.addEventListener('click', function (e) { e.stopPropagation() }, false)
		
		return this
	},
	
	hide: function ()
	{
		if (!this.visible)
			return
		
		this.nodes.root.hide()
		this.visible = false
		
		var me = this
		setTimeout(function () { me.unbindListeners() }, 0)
	},
	
	show: function ()
	{
		if (this.visible)
			return
		
		var nodes = this.nodes
		nodes.root.show()
		nodes.front.style.top = (document.documentElement.scrollTop || document.body.scrollTop) + 'px'
		this.visible = true
		
		var me = this
		setTimeout(function () { me.bindListeners() }, 0)
	},
	
	bindListeners: function ()
	{
		document.addEventListener('click', this.listeners.click, false)
		document.addEventListener('keydown', this.listeners.key, false)
	},
	
	unbindListeners: function ()
	{
		document.removeEventListener('click', this.listeners.click, false)
		document.removeEventListener('keydown', this.listeners.key, false)
	}
}

// Me.mixIn(EventDriven)
Me.className = myName
self[myName] = Me

})();
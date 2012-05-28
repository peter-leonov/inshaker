;(function(){

var myName = 'Popup'

var KEY_ESC = 27

function Me ()
{
	this.nodes = {}
	this.listeners = {}
	this.constructor = Me
}

Me.prototype =
{
	visible: false,
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		this.listeners.click = function (e) { me.hideFromUI() }
		this.listeners.key = function (e) { if (e.keyCode == KEY_ESC){ e.preventDefault(); me.hideFromUI() }}
		
		nodes.window.addEventListener('click', function (e) { e.stopPropagation() }, false)
		
		return this
	},
	
	hideFromUI: function ()
	{
		if (!this.dispatchEvent({type: 'ui-hide'}))
			return false
		
		this.hide()
	},
	
	hide: function ()
	{
		if (!this.visible)
			return
		
		if (!this.dispatchEvent({type: 'hide'}))
			return false
		
		
		this.nodes.root.hide()
		this.visible = false
		
		var me = this
		window.setTimeout(function () { me.unbindListeners() }, 0)
	},
	
	show: function ()
	{
		if (this.visible)
			return
		
		if (!this.dispatchEvent({type: 'show'}))
			return false
		
		var nodes = this.nodes
		nodes.root.show()
		nodes.front.style.top = window.pageYOffset + 'px'
		this.visible = true
		
		var me = this
		window.setTimeout(function () { me.bindListeners() }, 0)
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

Me.mixIn(EventDriven)

Me.className = myName
self[myName] = Me

})();
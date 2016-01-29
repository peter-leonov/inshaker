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
	
	adjustPosition: function (e)
	{
	  this.nodes.front.style.top = window.pageYOffset + 'px'
	},
	
	show: function ()
	{
		if (this.visible)
			return
		
		if (!this.dispatchEvent({type: 'show'}))
			return false
		
		var nodes = this.nodes
		nodes.root.show()
		this.adjustPosition()
		this.visible = true
		
		var me = this
		window.setTimeout(function () { me.bindListeners() }, 0)
	},
	
	bindListeners: function ()
	{
		this.nodes.back .addEventListener('click', this.listeners.click, false)
		this.nodes.cross.addEventListener('click', this.listeners.click, false)
		this.nodes.cross.addEventListener('touchstart', this.listeners.click, false)
		document.addEventListener('keydown', this.listeners.key, false)
	},
	
	unbindListeners: function ()
	{
		// no need to unbind clicks

		document.removeEventListener('keydown', this.listeners.key, false)
	}
}

Me.mixIn(EventDriven)

Me.className = myName
self[myName] = Me

})();
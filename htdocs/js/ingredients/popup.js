;(function(){

var myName = 'Popup'

function Me ()
{
	this.nodes = {}
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
		nodes.root.addEventListener('click', function (e) { me.hide() }, false)
		nodes.window.addEventListener('click', function (e) { e.stopPropagation() }, false)
		document.addEventListener('keypress', function (e) { e.keyCode == 27 && me.hide() }, false)
		
		return this
	},
	
	hide: function ()
	{
		if (!this.visible)
			return
		
		this.nodes.root.hide()
		this.visible = false
	},
	
	show: function ()
	{
		if (this.visible)
			return
		
		var nodes = this.nodes
		nodes.root.show()
		nodes.front.style.top = (document.documentElement.scrollTop || document.body.scrollTop) + 'px'
		this.visible = true
	}
}

// Me.mixIn(EventDriven)
Me.className = myName
self[myName] = Me

})();
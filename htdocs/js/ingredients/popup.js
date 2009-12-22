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
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		nodes.root.addEventListener('click', function (e) { me.hide() }, false)
		nodes.window.addEventListener('click', function (e) { e.stopPropagation() }, false)
		
		return this
	},
	
	hide: function ()
	{
		this.nodes.root.hide()
	},
	
	show: function ()
	{
		var nodes = this.nodes
		nodes.root.show()
		nodes.front.style.top = (document.documentElement.scrollTop || document.body.scrollTop) + 'px'
	}
}

// Me.mixIn(EventDriven)
Me.className = myName
self[myName] = Me

})();
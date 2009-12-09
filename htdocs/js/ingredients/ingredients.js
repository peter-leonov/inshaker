;(function(){

var myName = 'WidgetName',
	Me = self[myName] = MVC(myName)

// Me.mixIn(EventDriven)
// eval(NodesShortcut())

Me.prototype.extend
({
	initialize: function ()
	{
		this.nodes = {}
	},

	bind: function (nodes)
	{
		this.nodes = nodes
		
		
		return this
	}
})

})();
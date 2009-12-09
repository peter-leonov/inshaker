;(function(){

var myName = 'IngredientsPage',
	Me = self[myName] = MVC.create(myName)

// Me.mixIn(EventDriven)
// eval(NodesShortcut())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
	},

	bind: function (nodes)
	{
		this.nodes = nodes
		
		
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();
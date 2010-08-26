;(function(){

var myName = 'IngredientPopup'

function Me ()
{
	this.nodes = {}
	this.constructor = Me
}

Me.setup = function (nodes)
{
	var prototype = this.prototype
	
	prototype.commonNodes = nodes
	
	var cloner = prototype.cloner = new Cloner()
	cloner.bind(nodes.popupMain, nodes.popupParts)
}

// eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		
		
		return this
	}
}

// Me.mixIn(EventDriven)
Me.className = myName
self[myName] = Me

})();
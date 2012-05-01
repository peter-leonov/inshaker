;(function(){

function Me ()
{
	this.nodes = {}
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
	}
}

Papa.View = Me

})();
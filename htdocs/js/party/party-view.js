;(function(){

function Me ()
{
	this.nodes = {}
}

eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		nodes.count.addEventListener('keydown', function (e) { if (e.keyCode == 13) { this.blur(); e.preventDefault() } }, false)
		nodes.count.addEventListener('focus', function (e) { this.addClassName('focused') }, false)
		nodes.count.addEventListener('blur', function (e) { this.removeClassName('focused') }, false)
		
		return this
	}
}

Papa.View = Me

})();

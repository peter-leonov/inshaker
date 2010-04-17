;(function(){

var myName = 'RoundedCorners'

function Me () {}

Me.round = function (node)
{
	node.appendChild(this.corners.cloneNode(true))
}

Me.init = function (node)
{
	var corners = this.corners = document.createElement('b')
	corners.className = 'rounding-corners'
	
	var classes = ['lt', 'rt', 'rb', 'lb']
	for (var i = 0, il = classes.length; i < il; i++)
	{
		var corner = document.createElement('b')
		corner.className = classes[i]
		corners.appendChild(corner)
	}
}

Me.className = myName
self[myName] = Me

Me.init()

})();
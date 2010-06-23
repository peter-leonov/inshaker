;(function(){

var myName = 'BarPoint'

function Me (bar)
{
	this.latlng = {lat: bar.point[0], lng: bar.point[1]}
	this.nodes = {}
	this.id = ++BarPoint.count
}

Me.count = 0

eval(NodesShortcut.include())

Me.prototype =
{
	latlng: {lat: 0, lng: 0},
	
	createNode: function ()
	{
		return this.node || (this.node = this.render())
	},
	
	render: function ()
	{
		var nodes = this.nodes
		
		var main = nodes.main = Nc('div', 'point')
		nodes.icon = main.appendChild(Nc('div', 'icon'))
		var title = nodes.title = main.appendChild(Nc('div', 'title'))
		var name = nodes.name = title.appendChild(Nc('span', 'point-name', name))
		nodes.nameText = name.appendChild(T(''))
		nodes.titleText = title.appendChild(T(this.address))
		
		return main
	}
}

Me.className = myName
self[myName] = Me

})();

;(function(){

var myName = 'BarPoint'

function Me (bar)
{
	this.bar = bar
	this.ll = {lat: bar.point[0], lng: bar.point[1]}
	this.nodes = {}
}

Me.prototype = new MapLightMarker()

eval(NodesShortcut.include())

var myProto =
{
	ll: {lat: 0, lng: 0},
	
	createNode: function ()
	{
		return this.node || (this.node = this.getNode())
	},
	
	getNode: function ()
	{
		var nodes = this.nodes
		
		var main = nodes.main = Nc('div', 'point')
		nodes.icon = main.appendChild(Nc('div', 'icon'))
		var title = nodes.title = main.appendChild(Nc('div', 'title'))
		var name = nodes.name = title.appendChild(Nc('span', 'point-name', name))
		nodes.nameText = name.appendChild(T(this.bar.name))
		
		var contacts = this.bar.contacts
		if (contacts)
			nodes.titleText = title.appendChild(T(contacts.address + ', ' + contacts.tel))
		
		return main
	}
}

Object.extend(Me.prototype, myProto)

Me.className = myName
self[myName] = Me

})();

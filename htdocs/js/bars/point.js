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

function stopPropagation (e) { e.stopPropagation() }

var myProto =
{
	createNode: function ()
	{
		return this.node || (this.node = this.getNode())
	},
	
	getNode: function ()
	{
		var nodes = this.nodes,
			bar = this.bar
		
		var main = nodes.main = Nc('div', 'point')
		main.addEventListener('mousedown', stopPropagation, false)
		
		var icon = nodes.icon = main.appendChild(Nc('a', 'icon'))
		icon.href = this.bar.pageHref()
		
		var title = nodes.title = main.appendChild(Nc('dl', 'title'))
		
		var name = nodes.name = title.appendChild(Nct('dt', 'point-name', bar.name))
		
		var contacts = bar.contacts
		if (contacts)
		{
			nodes.address = title.appendChild(Nct('dd', 'address', contacts.address))
			nodes.tel = title.appendChild(Nct('dd', 'tel', contacts.tel))
		}
		
		return main
	}
}

Object.extend(Me.prototype, myProto)

Me.className = myName
self[myName] = Me

})();

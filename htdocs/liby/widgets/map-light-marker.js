;(function(){

var myName = 'MapLightMarker'

function Me () {}

eval(NodesShortcut.include())

Me.prototype = new Map.Overlay()

var myProto =
{
	onAdd: function (map)
	{
		var node = this.node
		if (!node)
			node = this.node = this.createNode()
		
		this.getPanes().overlayImage.appendChild(node)
	},
	
	createNode: function ()
	{
		return Nct('div', 'point', 'createNode() is not implemented')
	},
	
	draw: function ()
	{
		var sw = this.getProjection().fromLatLngToDivPixel(this.latlng)
		
		var style = this.node.style
		style.left = sw.x + 'px'
		style.top = sw.y + 'px'
	},
	
	onRemove: function ()
	{
		this.node.remove()
	}
}

Object.extend(Me.prototype, myProto)

self[myName] = Me
Me.className = myName

})();

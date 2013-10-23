<!--# include virtual="/liby/modules/google-api-loader.js" -->

<!--# include virtual="/liby/widgets/map.js" -->
<!--# include virtual="/liby/widgets/map-light-marker.js" -->

<!--# include virtual="/js/common/google.js" -->

<!--# include virtual="map-point.js" -->


$.onready(function ()
{
	var nodes =
	{
		address: $('.info .location p'),
		phone: $('.info .phone p'),
		
		map: $('#map'),
		mapSurface: $('#map .surface'),
		positionControl: $('.position-control')
	}
	
	var widget = new MapWidget(nodes)
	widget.render()
})

;(function(){

function MapWidget (nodes)
{
	this.nodes = nodes
}

MapWidget.prototype =
{
	render: function ()
	{
		this.initMap()
	},
	
	initMap: function ()
	{
		if (this.map)
			return
		
		var map = this.map = new Map()
		map.bind({main: this.nodes.mapSurface, wrapper: this.nodes.map, control: this.nodes.positionControl})
		map.setCenter({lat: 55.783016, lng: 37.599892}, 14)
		
		var nodeValue = function (node)
		{
			return node.nodeValue
		}
		
		var shop =
		{
			name: 'Коктейльный магазин',
			contacts: {
				address: [].map.call(this.nodes.address.childNodes, nodeValue).join(''),
				tel: this.nodes.phone.firstChild.nodeValue
			},
			point: [55.783016, 37.599892]
		}
		map.setPoints([new ShopPoint(shop)])
	}
}

window.MapWidget = MapWidget

})();

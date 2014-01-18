<!--# include virtual="/liby/modules/google-api-loader.js" -->

<!--# include virtual="/liby/widgets/map.js" -->
<!--# include virtual="/liby/widgets/map-light-marker.js" -->

<!--# include virtual="/js/common/google.js" -->

<!--# include virtual="map-point.js" -->


$.onready(function ()
{
  // check, if the banner is present on a page
  if (!$('#shop-map-banner'))
    return
  
	var nodes =
	{
		address: $('#shop-map-banner .info .location p'),
		phone: $('#shop-map-banner .info .phone p'),
		
		map: $('#shop-map-banner .map'),
		positionControl: $('#shop-map-banner .position-control')
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
		map.bind({main: this.nodes.map, control: this.nodes.positionControl})
		map.setCenter({lat: 55.78255, lng: 37.599892}, 17)
		
		var shop =
		{
			name: 'Коктейльный магазин',
			contacts: {
				address: this.nodes.address.firstChild.nodeValue,
				tel: this.nodes.phone.firstChild.nodeValue
			},
			point: [55.783016, 37.599892]
		}
		map.setPoints([new ShopPoint(shop)])
	}
}

window.MapWidget = MapWidget

})();

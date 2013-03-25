<!--# include virtual="/liby/modules/google-api-loader.js" -->

<!--# include virtual="/liby/widgets/map.js" -->
<!--# include virtual="/liby/widgets/map-light-marker.js" -->

<!--# include virtual="/js/common/google.js" -->



$.onready(function ()
{
	UserAgent.setupDocumentElementClassNames()
	
	var nodes =
	{
		map: $('#map'),
		mapSurface: $('#map .surface'),
		positionControl: $('.position-control')
	}
	
	var widget = new ShopPage(nodes)
	widget.render()
})

;(function(){

function ShopPage (nodes)
{
	this.nodes = nodes
}

ShopPage.prototype =
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
		map.setCenter({lat: 55.751755, lng: 37.624657}, 9)
	}
}

window.ShopPage = ShopPage

})();

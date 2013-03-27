<!--# include virtual="/liby/modules/google-api-loader.js" -->

<!--# include virtual="/liby/widgets/map.js" -->
<!--# include virtual="/liby/widgets/map-light-marker.js" -->

<!--# include virtual="/js/common/google.js" -->

<!--# include virtual="shop-point.js" -->



$.onready(function ()
{
	UserAgent.setupDocumentElementClassNames()
	
	var nodes =
	{
		address: $('.promo .info .location a'),
		phone: $('.promo .info .phone p'),
		
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
		
		var shop =
		{
			name: 'Inshaker на САМОСКЛАДе',
			contacts:
			{
				address: this.nodes.address.firstChild.nodeValue,
				tel: this.nodes.phone.firstChild.nodeValue
			},
			point: [55.766212, 37.640148]
		}
		map.setPoints([new ShopPoint(shop)])
	}
}

window.ShopPage = ShopPage

})();

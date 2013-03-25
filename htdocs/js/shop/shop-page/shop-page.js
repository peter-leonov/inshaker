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
		
	}
}

window.ShopPage = ShopPage

})();

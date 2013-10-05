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
    promo: $('#promo'),
    
    address: $('#promo .info .location a'),
    phone: $('#promo .info .phone p'),
    
    map: $('#map'),
    mapSurface: $('#map .surface'),
    mapClose: $('#map .close'),
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

function forceRedraw (node)
{
  document.body.className += ' '
}

ShopPage.prototype =
{
  render: function ()
  {
    var widget = this
    
    function switchToMap ()
    {
      widget.nodes.promo.setAttribute('data-state', 'map')
      forceRedraw()
      widget.initMap()
    }
    
    function switchToImage ()
    {
      widget.nodes.promo.setAttribute('data-state', 'image')
      forceRedraw()
    }
    
    this.nodes.address.addEventListener('click', switchToMap, false)
    this.nodes.mapClose.addEventListener('click', switchToImage, false)
  },
  
  initMap: function ()
  {
    if (this.map)
      return
    
    var map = this.map = new Map()
    map.bind({main: this.nodes.mapSurface, wrapper: this.nodes.map, control: this.nodes.positionControl})
    map.setCenter({lat: 55.783175, lng: 37.600684}, 16)
    
    var shop =
    {
      name: 'Коктейльный магазин',
      contacts:
      {
        address: this.nodes.address.firstChild.nodeValue,
        tel: this.nodes.phone.firstChild.nodeValue
      },
      point: [55.783175, 37.600684]
    }
    map.setPoints([new ShopPoint(shop)])
  }
}

window.ShopPage = ShopPage

})();

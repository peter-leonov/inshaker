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
		
		address: $('#promo .info .location p'),
		phone: $('#promo .info .phone p'),
		
		map: $('#map .map'),
		positionControl: $('.position-control'),
		
		cocktails: $('#coctails'),
		
		photos:
		{
			root:     $('.photos'),
			viewport: $('.photos .viewport'),
			surface:  $('.photos .surface'),
			prev:     $('.photos .prev'),
			next:     $('.photos .next'),
			items:   $$('.photos .point')
		}
	}
	
	var widget = new GoodPage(nodes)
	widget.render()
})

;(function(){

eval(NodesShortcut.include())

function GoodPage (nodes)
{
	this.nodes = nodes
}

GoodPage.prototype =
{
	render: function ()
	{
		this.initMap()
		this.initCocktails()
		this.renderPhotos()
	},
	
	initMap: function ()
	{
		if (this.map)
			return
		
		var map = this.map = new Map()
		map.bind({main: this.nodes.map, control: this.nodes.positionControl})
		map.setCenter({lat: 55.783016, lng: 37.599892}, 14)
		
		var shop =
		{
			name: 'Коктейльный магазин',
			contacts:
			{
				address: this.nodes.address.firstChild.nodeValue,
				tel: this.nodes.phone.firstChild.nodeValue
			},
			point: [55.783016, 37.599892]
		}
		map.setPoints([new ShopPoint(shop)])
	},
	
	initCocktails: function ()
	{
		var cocktails = InPageCahchedData.cocktails,
			fragment = document.createDocumentFragment()
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = this.renderCocktail(cocktails[i])
			fragment.appendChild(cocktail)
		}
		
		this.nodes.cocktails.appendChild(fragment)
	},
	
	renderCocktail: function (cocktail)
	{
		var li = N('li')
		
		var a = N('a')
		a.href = cocktail.legacyUri
		li.appendChild(a)
		
		var image = Nc('div', 'image')
		a.appendChild(image)
		
		var img = N('img')
		img.src = cocktail.imageUrl
		image.appendChild(img)
		
		var name = Nct('div', 'name', cocktail.name)
		a.appendChild(name)
		
		return li
	},
	
	renderPhotos: function ()
	{
		var photos = this.nodes.photos,
			items = photos.items
		
		var total = items.length,
			last = photos.surface.appendChild(items[0].cloneNode(true))
		
		var list = new LazyList()
		list.bind(photos)
		list.configure({pageLength: 1, friction: 100, pageVelocity: 46.5, soft: Infinity, min: 75, max: 100})
		list.load = function (nodes)
		{
			for (var i = 0, il = nodes.length; i < il; i++)
			{
				// buggy in Firefox
				var image = nodes[i].firstChild
				if (!image.src)
					image.src = image.getAttribute('data-lazy-src')
			}
		}
		list.setNodes(items, total)
		list.load([last])
	}
}

window.GoodPage = GoodPage

})();

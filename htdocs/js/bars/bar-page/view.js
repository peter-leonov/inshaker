{(function(){

var doc = document
function N (name) { return doc.createElement(name) }
function T (text) { return doc.createTextNode(text) }

function Me () {}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var share = new ShareBox()
		share.bind(nodes.shareBox)
		share.render(window.location.href, 'Бар «' + nodes.barName.getAttribute('data-value') + '»')
		
		this.renderPhotos()
	},
	
	renderPhotos: function ()
	{
		var photos = this.nodes.photos,
			items = photos.items
		
		var total = items.length, last
		if (total > 1)
			last = photos.surface.appendChild(items[0].cloneNode(true))
		
		var list = new LazyList()
		list.bind(photos)
		list.configure({pageLength: 1, friction: 100, pageVelocity: 37.5, soft: Infinity, min: 75, max: 100})
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
	},
	
	modelChanged: function (data)
	{
		var nodes = this.nodes
		
		// bar
		this.bar = data.bar
		
		// cocktails
		this.renderCocktails(data.carte)
		this.renderMap(data.bar, data.otherBarsSet)
		this.renderPrevNext(data.prevNext)
	},
	
	readBarCityNames: function ()
	{
		var nodes = this.nodes,
			barName = nodes.barName.getAttribute('data-value'),
			cityName = nodes.cityName.getAttribute('data-value')
		
		var state = {}
		state.name = barName
		state.city = cityName
		
		this.controller.barCityNamesLoaded(state)
	},
	
	initMap: function (bar)
	{
		if (this.map)
			return
		
		var map = this.map = new Map(),
			nodes = this.nodes
		
		map.bind({main: this.nodes.map, control: nodes.positionControl})
	},
	
	renderMap: function (current, bars)
	{
		this.initMap()
		
		var map = this.map
		
		var points = []
		for (var i = 0; i < bars.length; i++)
		{
			var bar = bars[i]
			bar.mapPoint = points[i] = new BarPoint(bar)
		}
		map.setPoints(points)
		
		var node = current.mapPoint.createNode()
		node.classList.add('selected')
		map.setCenter({lat: current.point[0], lng: current.point[1]}, 15)
	},
	
	renderCocktails: function (cocktails)
	{
		this.nodes.hitBox.appendChild(cocktails[0].getPreviewNode(false, true))
	},
	
	renderPrevNext: function (prevNext)
	{
		if (prevNext[0])
		{
			this.nodes.barPrev.href = prevNext[0].pageHref()
			this.nodes.barPrev.title = prevNext[0].name
		}
		else
			this.nodes.barPrev.hide()
		
		if (prevNext[1])
		{
			this.nodes.barNext.href = prevNext[1].pageHref()
			this.nodes.barNext.title = prevNext[1].name
		}
		else
			this.nodes.barNext.hide()
	}
}

Papa.View = Me

})()}

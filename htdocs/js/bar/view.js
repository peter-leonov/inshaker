{(function(){

var doc = document
function N (name) { return doc.createElement(name) }
function T (text) { return doc.createTextNode(text) }

BarPage.view =
{
	owner: null, // must be defined before initialize
	
	initialize: function (nodes)
	{
		this.nodes = nodes
		
		this.renderPhotos()
		
		var barMore = nodes.barMore
		if (barMore)
		{
			barMore.maximize = function () { this.animate('easeOutQuad', {height: this.scrollHeight}, 1) }
			barMore.minimize = function () { this.animate('easeOutQuad', {height: 1}, 1) }
			barMore.toggleHeight = function ()
			{
				if (this.isMaximized)
				{
					this.minimize()
					return this.isMaximized = false
				}
				else
				{
					this.maximize()
					return this.isMaximized = true
				}
			}
		}
		
		var controller = this.owner.controller
		nodes.showMore.addEventListener('click', function () { controller.toggleMoreClicked() }, false)
		
		nodes.barPrev.hide = nodes.barNext.hide = function () { this.addClassName('hidden') }
	},
	
	renderPhotos: function ()
	{
		var photos = this.nodes.photos,
			items = photos.items
		
		var total = items.length
		if (total > 1)
			photos.surface.appendChild(items[0].cloneNode(true))
		
		var list = new LazyList()
		list.bind(photos)
		list.configure({pageLength: 1, friction: 100, pageVelocity: 37.5, soft: Infinity, min: 75, max: 100})
		list.load = function (nodes)
		{
			for (var i = 0, il = nodes.length; i < il; i++)
			{
				// buggy in Firefox
				// var image = nodes[i].firstChild
				// if (!image.src)
				// 	image.src = image.getAttribute('data-lazy-src')
			}
		}
		list.setNodes(items, total)
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
			barName = nodes.barName.innerHTML,
			cityName = nodes.cityName.innerHTML
		
		var state = {}
		state.name = barName
		state.city = cityName
		
		this.owner.controller.barCityNamesLoaded(state)
	},
	
	toggleMore: function ()
	{
		var barMore = this.nodes.barMore
		if (barMore)
		{
			var miximized = barMore.toggleHeight()
			this.owner.controller[miximized ? 'moreIsMaximized' : 'moreIsMinimized']()
		}
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
		node.addClassName('selected')
		map.setCenter({lat: current.point[0], lng: current.point[1]}, 13)
	},
	
	renderCocktails: function (cocktails)
	{
		var listNodes = this.nodes.carte
		
		var clNodes =
		{
			root: listNodes.root,
			viewport: listNodes.viewport,
			surface: listNodes.surface,
			prev: listNodes.prev,
			next: listNodes.next
		}

		var cl = new CocktailList()
		cl.bind(clNodes)
		cl.configure({pageLength: 5, pageVelocity: 35.5})
		cl.setCocktails(cocktails)
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

})()}

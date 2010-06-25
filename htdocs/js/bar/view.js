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
		
		// new Programica.RollingImagesLite(nodes.photos, {animationType: 'easeOutQuad'})
		// new Programica.RollingImagesLite(nodes.carte, {animationType: 'easeInOutCubic'})
		
		
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
	
	modelChanged: function (data)
	{
		var nodes = this.nodes
		
		// bar
		this.bar = data.bar
		
		// cocktails
		this.renderCocktails(nodes.carte, data.carte, 4)
		this.renderMap(data.bar, data.otherBarsSet)
		this.renderPrevNext(data.prevNext)
	},
	
	readBarCityNames: function ()
	{
		var nodes = this.nodes,
			barName = nodes.barName.innerHTML,
			cityName = nodes.cityName.innerHTML,
			winStr, state
		
		if (winStr = WindowName.get('bars:state'))
			state = UrlEncode.parse(winStr)
		else
			state = {}
		
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
	
	renderMap: function (bar, bars)
	{
		this.initMap()
		
		var map = this.map
		
		var points = []
		for (var i = 0; i < bars.length; i++)
			points[i] = new BarPoint(bars[i])
		map.setPoints(points)
		
		
		map.setCenter({lat: bar.point[0], lng: bar.point[1]}, 13)
	},
	
	renderCocktails: function (node, set, len)
	{
		var parent = node.getElementsByClassName('surface')[0]
		parent.empty()
		for (var i = 0; i < set.length; i++)
		{
			if (i % len == 0)
			{
				var point = document.createElement('ul')
				point.className = 'point'
				parent.appendChild(point)
			}
			if (set[i])
			point.appendChild(this._createCocktailElement(set[i]))
		}
		// node.RollingImagesLite.sync()
	},
	
	_createCocktailElement: function (cocktail) { return cocktail.getPreviewNode() },
	
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

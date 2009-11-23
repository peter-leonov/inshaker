{(function(){

var doc = document
function N (name) { return doc.createElement(name) }
function T (text) { return doc.createTextNode(text) }

BarPage.view =
{
	owner: null, // must be defined before initialize
	
	initialize: function (nodes)
	{
		loadGoogleApi.delay(1000)
		
		this.nodes = nodes
		
		new Programica.RollingImagesLite(nodes.photos, {animationType: 'easeOutQuad'})
		new Programica.RollingImagesLite(nodes.recommendations)
		new Programica.RollingImagesLite(nodes.carte, {animationType: 'easeInOutCubic'})
		
		
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
		
		var barman
		if (nodes.barman && (barman = Barman.getByName(nodes.barman.innerHTML)))
			new InfoPopup(nodes.barman, nodes.barmanInfoPopup, barman)
		
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
		this.renderCocktails(nodes.recommendations, data.recommendations, 1)
		this.renderCocktails(nodes.carte, data.carte, 3)
		this.renderMap(data.bar, data.otherBarsSet)
		this.renderPrevNext(data.prevNext)
		
		this.renderPriceIndex(data.bar)
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
		if (!this.gMap)
		{
			var map = this.gMap = new GMap2(this.nodes.map)
			map.addControl(new GSmallMapControl(), new GControlPosition(G_ANCHOR_BOTTOM_RIGHT))
			map.enableContinuousZoom()
			// map.enableScrollWheelZoom()
		}
		
		if (!this.gIcon)
		{
			var gIcon = new GIcon()
			gIcon.image = '/t/bars/bar-icon.png'
			gIcon.iconAnchor = new GPoint(12, 34)
			gIcon.infoWindowAnchor = new GPoint(16, 0)
			gIcon.infoShadowAnchor = new GPoint(18, 25)
			this.gIcon = gIcon	
		}
	},
	
	waitGMap: function (f)
	{
		this.waitGMapFunction = f
	},
	
	loadedGMap: function ()
	{
		if (this.waitGMapFunction)
		{
			this.waitGMapFunction()
			this.waitGMapFunction = null
		}
	},
	
	isGMapLoaded: function ()
	{
		return !!window.GLatLng
	},
	
	renderMap: function (bar, otherBarsSet)
	{
		if (!this.isGMapLoaded())
			return this.waitGMap(arguments.callee.bind(this, arguments))
		else
			this.initMap()
		
		var map = this.gMap
		
		var ll = new GLatLng(bar.point[0], bar.point[1])
		var zoom = 13
		var gMarker = this.getGMarker(bar)
		
		map.setCenter(ll, zoom)
		map.addOverlay(gMarker)
		
		for (var i = 0; i < otherBarsSet.length; i++)
		{
			var otherBar = otherBarsSet[i]
			var gMarker = this.getGMarker(otherBar)
			map.addOverlay(gMarker)
		}
		
		this.showMainBarMapPopup(bar)
	},
	
	getGMarker: function (bar)
	{
		var gPoint = new GLatLng(bar.point[0], bar.point[1])
		// var mkey = bar.point[0] + ':' + bar.point[1]
		var gMarker = new GMarker(gPoint, {icon: this.gIcon})
		var me = this
		function click () { me.owner.controller.gMarkerClicked(this) }
		GEvent.addListener(gMarker, 'click', click)
		gMarker.bar = bar
		bar.gMarker = gMarker
		return gMarker
	},
	
	showMainBarMapPopup: function (bar)
	{
		var address = ''
		if (bar.address)
		{
			address = bar.address[0] + '<br/>' + bar.address[1]
			if (bar.address[2])
				address += '<br/><a href="http://' + bar.address[2] + '">' + bar.address[2] + '</a>'
		}
		bar.gMarker.openInfoWindowHtml('<div class="bar-map-popup"><h2>' + bar.name + '</h2><p>' + address + '</p></div>')
	},
	
	showBarMapPopup: function (bar)
	{
		var address = ''
		if (bar.address)
		{
			address = bar.address[0] + '<br/>' + bar.address[1]
			if (bar.address[2])
				address += '<br/><a href="http://' + bar.address[2] + '">' + bar.address[2] + '</a>'
		}
		bar.gMarker.openInfoWindowHtml('<div class="bar-map-popup"><h2>' + bar.name + '</h2><p>' + address + '</p><a href="' + bar.pageHref() + '">Посмотреть бар…</a></div>')
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
		node.RollingImagesLite.sync()
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
	},
	
	renderPriceIndex: function(bar)
	{
		this.nodes.priceIndex.appendChild(document.createTextNode(bar.priceIndex + " р."))
	}
}

})()}

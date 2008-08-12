BarPage.view =
{
	owner: null, // must be defined before initialize
	
	initialize: function (nodes)
	{
		this.nodes = nodes
		
		new Programica.RollingImagesLite(nodes.photos, {animationType: 'easeOutQuad'})
		new Programica.RollingImagesLite(nodes.recommendations)
		new Programica.RollingImagesLite(nodes.carte, {animationType: 'easeInOutCubic'})
		
		
		var barMore = nodes.barMore
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
		
		var me = this
		nodes.showMore.addEventListener('click', function () { me.owner.controller.toggleMoreClicked() }, false)
	},
	
	modelChanged: function (bar, recommendations, carte, otherBarsSet)
	{
		var nodes = this.nodes
		
		// bar
		
		// cocktails
		this.renderCocktails(nodes.recommendations, recommendations, 1)
		this.renderCocktails(nodes.carte, carte, 3)
		this.renderMap(bar, otherBarsSet)
	},
	
	readBarCityNames: function ()
	{
		var nodes = this.nodes
		var barName = nodes.barName.innerHTML
		var cityName = nodes.cityName.innerHTML
		
		this.owner.controller.barCityNamesLoaded(barName, cityName)
	},
	
	toggleMore: function ()
	{
		var miximized = this.nodes.barMore.toggleHeight()
		this.owner.controller[miximized ? 'moreIsMaximized' : 'moreIsMinimized']()
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
			gIcon.shadow = '/t/bg/bars/bar-icon.png'
			gIcon.image = '/t/bg/bars/bar-icon.png'
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
		bar.gMarker.openInfoWindowHtml('<div class="bar-map-popup"><h2>' + bar.name + '</h2><p>' + bar.address + '</p></div>')
	},
	
	showBarMapPopup: function (bar)
	{
		bar.gMarker.openInfoWindowHtml('<div class="bar-map-popup"><h2>' + bar.name + '</h2><p>' + bar.address + '</p><a href="/bars/' + bar.id + '.html">Посмотреть бар…</a></div>')
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
	
	_createCocktailElement: function (cocktail)
	{
		var li = document.createElement("li")
		var a = document.createElement("a")
		a.href = "/cocktails/" + cocktail.name_eng.htmlName() + ".html"
		var img = document.createElement("img")
		img.src = "/i/cocktail/s/" + cocktail.name_eng.htmlName() + ".png"
		var txt = document.createTextNode(cocktail.name)
		a.appendChild(img)
		a.appendChild(txt)
		li.appendChild(a)
		return li
	}
}
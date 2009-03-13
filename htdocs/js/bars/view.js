function BarsPageView ()
{
	BarsPageView.name = "BarsPageView"
	this.constructor = BarsPageView
	this.initialize.apply(this, arguments)
}

BarsPageView.prototype =
{
	cache: {barNode:{}},
	
	initialize: function (controller, nodes)
	{
		this.controller = controller
		this.nodes = nodes
		
		// loadGoogleApi.delay(1000)
		// {format: 'выпить по коктейльчику', feel: 'хороших людей'}
		this.nodes = nodes
		var me = this
		// nodes.citySelect.onselect	= function (val) { controller.citySelected(val) }
		nodes.formatSelect.onselect = function (val) { controller.formatSelected(val) }
		nodes.feelSelect.onselect	= function (val) { controller.feelSelected(val) }
		Switcher.bind(nodes.viewSwitcher, nodes.viewSwitcherButtons, [this.nodes.barsContainer, this.nodes.map])
		nodes.viewSwitcher.setNames(['list', 'map'])
		nodes.viewSwitcher.onselect = function (num) { me._setViewNum(num) }
		nodes.photographer.addEventListener('click', function(e){ nodes.photoPopup.show() }, false)
		
		var pci = nodes.photoCloseItems
		for(var i = 0; i < pci.length; i++){
			pci[i].addEventListener('click', function(e){ nodes.photoPopup.hide() }, false)
		}
		
		// Selecter.bind(nodes.citySelect)
		Selecter.bind(nodes.formatSelect)
		Selecter.bind(nodes.feelSelect)
		
		nodes.titleSearchAll.addEventListener('mousedown', function () { controller.showAllBars({}) }, false)
    new NewsFormPopup(nodes.dontMiss)
	},
	
	checkHash: function ()
	{
		var hash = null,
			hashStr, winStr
		
		if (hashStr = location.hash.substr(1))
			hash = UrlEncode.parse(hashStr)
		else if (winStr = WindowName.get('bars:state'))
			hash = UrlEncode.parse(winStr)
		
		this.controller.hashUpdated(hash)
	},
	
	setHash: function (hash)
	{
		var urledHash = UrlEncode.stringify(hash)
		location.hash = "#" + urledHash
		WindowName.set('bars:state', urledHash)
	},
	
	modelChanged: function (data)
	{
		this.renderBars(data)
	},
	
	_setViewNum: function (num)
	{
		var type = ['list','map'][num]
		this.setViewType(type)
		this.controller.viewTypeSwitched(type)
	},
	
	setViewType: function (type)
	{
		this.nodes.viewSwitcher.drawSelected(type)
	},
	
	renderCities: function (options, selected)
	{
		// var node = this.nodes.citySelect
		// node.setOptions(options)
		// node.select(selected || 0, true)
	},
	
	renderFormats: function (options, selected)
	{
		var node = this.nodes.formatSelect
		node.setOptions(options)
		node.select(selected || 0, true)
	},
	
	renderFeels: function (options, selected)
	{
		var node = this.nodes.feelSelect
		node.setOptions(options)
		node.select(selected || 0, true)
	},
	
	renderBars: function (data)
	{
		var state = data.state
		if (!state.view || state.view == 'list')
			return this.renderBarsList(data)
		else if (state.view == 'map')
			return this.renderBarsMap(data)
		else
			log('Unknown view type "' + state.view + '"')
	},
	renderBarsList: function (data)
	{
		var parent = this.nodes.barsContainer,
			bars = data.bars,
			state = data.state
		
		parent.empty()
		for (var i = 0; i < bars.length; i++)
		{
			var bar = bars[i]
			var node = this.getBarNode(bar)
			parent.appendChild(node)
			parent.appendChild(document.createTextNode(' '))
		}
	},
	renderBarsMap: function (data)
	{
		var bars = data.bars,
			state = data.state,
			city = data.city
		
		if (!this.isGMapLoaded())
			return this.waitGMap(arguments.callee.bind(this, arguments))
		else
			this.initMap()
		
		if (this.lastCity != state.city)
		{
			var lat, lng, zoom
			if (!this.lastCity && state.lat && state.lng)
			{
				lat = parseFloat(state.lat)
				lng = parseFloat(state.lng)
				zoom = parseInt(state.zoom) || 10
			}
			else
			{
				var point = city.point
				lat = point[0]
				lng = point[1]
				zoom = city.zoom || 10
			}
			
			this.gMapMove(lat, lng, zoom)
			this.lastCity = state.city
		}
		var map = this.gMap
		map.clearOverlays()
		for (var i = 0; i < bars.length; i++)
		{
			var bar = bars[i]
			if (!bar.gMarker)
				bar.gMarker = this.getGMarker(bar)
			map.addOverlay(bar.gMarker)
		}
	},
	
	gMapMove: function (lat, lng, zoom)
	{
		// log('gMapMove', lat, lng, zoom)
		var map = this.gMap
		if (map)
		{
			// if (this.checkLatLngZoom(lat, lng, zoom))
				map.setCenter(new GLatLng(lat, lng), zoom)
		}
	},
	
	checkLatLngZoom: function (nlat, nlng, nzoom)
	{
		var map = this.gMap,
			ll = map.getCenter()
		
		if (!ll)
			return true
		
		var lat = ll.lat(),
			lng = ll.lng(),
			zoom = map.getZoom()
		
		return !(nlat == lat && nlng == lng && nzoom == zoom)
	},
	
	initMap: function ()
	{
		var me = this
		if (!this.gMap)
		{
			var mapNode = this.nodes.map
			// var isVisible = mapNode.visible()
			// mapNode.show()
			var map = new GMap2(mapNode)
			// if (!isVisible)
				// mapNode.hide()
			map.addControl(new GSmallMapControl())
			map.enableContinuousZoom()
			map.enableScrollWheelZoom()
			GEvent.addListener(map, 'moveend', function () { me.controller.gMapMoveEnd(map.getCenter(), map.getZoom()) })
			this.gMap = map
		}
		
		if (!this.gIcon)
		{
			var gIcon = new GIcon()
			// gIcon.shadow = '/t/bars/bar-icon.png'
			gIcon.image = '/t/bars/bar-icon.png'
			gIcon.iconAnchor = new GPoint(12, 34)
			gIcon.infoWindowAnchor = new GPoint(16, 0)
			gIcon.infoShadowAnchor = new GPoint(18, 25)
			this.gIcon = gIcon	
		}
	},
	
	waitGMap: function (f)
	{
		if (f)
			loadGoogleApi()
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
	
	getGMarker: function (bar)
	{
		var gPoint = new GLatLng(bar.point[0], bar.point[1])
		// var mkey = bar.point[0] + ':' + bar.point[1]
		var gMarker = new GMarker(gPoint, {icon: this.gIcon})
		var me = this
		function click () { me.controller.gMarkerClicked(gMarker) }
		GEvent.addListener(gMarker, 'click', click)
		gMarker.bar = bar
		bar.gMarker = gMarker
		return gMarker
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
	
	renderTitle: function (cocktail)
	{
		var nodes = this.nodes
		if (cocktail)
		{
			nodes.titleAll.hide()
			nodes.titleSearch.show()
			var nameNode = nodes.titleSearchName
			nameNode.innerHTML = cocktail.name
			nameNode.href = '/cocktails/' + cocktail.name_eng.htmlName() + '.html'
		}
		else
		{
			nodes.titleSearch.hide()
			nodes.titleAll.show()
		}
	},
	
	getBarNode: function (bar)
	{
		var main = this.cache.barNode[bar.id] || (this.cache.barNode[bar.id] = this.createBarNode(bar))
		main.setName(bar.name)
		main.setImage(bar.smallImageHref())
		main.setHref(bar.pageHref())
		return main
	},
	
	createBarNode: function (bar)
	{
		var main = document.createElement('div')
		var name = document.createElement('a')
		main.appendChild(name)
		
		main.className = 'bar-mini'
		main.setImage = function (src) { main.style.backgroundImage = 'url('+src+')' }
		main.setName = function (text) { name.innerHTML = text }
		main.setHref = function (href) { name.href = href }
		return main
	}
}

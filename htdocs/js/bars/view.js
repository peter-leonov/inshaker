BarsPage.view =
{
	owner: BarsPage,
	cache: {barNode:{}},
	any: {format: 'делать что угодно', feel: 'с кем угодно'},
	
	initialize: function (nodes, citiesDB)
	{
		this.citiesDB = citiesDB
		this.nodes = nodes
		var me = this,
			controller = me.owner.controller,
			viewSwitcher = nodes.viewSwitcher
		nodes.citySelect.onselect	= function (val) { controller.citySelected(val) }
		nodes.formatSelect.onselect = function (val) { controller.formatSelected(val == me.any.format ? undefined : val) }
		nodes.feelSelect.onselect	= function (val) { controller.feelSelected(val == me.any.feel ? undefined : val) }
		nodes.viewSwitcher.onselect = function (num) { me._setViewNum(num) }
		Switcher.bind(viewSwitcher, viewSwitcher.childNodes, [this.nodes.barsContainer, this.nodes.map])
		viewSwitcher.setNames(['list', 'map'])
		
		Selecter.bind(nodes.citySelect)
		Selecter.bind(nodes.formatSelect)
		Selecter.bind(nodes.feelSelect)
		
		nodes.titleSearchAll.addEventListener('mousedown', function () { controller.showAllBars({}) }, false)
		// nodes.viewSwitcher.autoSelect = false
		// this.initMap()
		
		this.lastHash = null
		var location = document.location
		// setInterval(function () { me.checkHash() }, 250)
		this.checkHash()
	},
	
	checkHash: function ()
	{
		var hashStr = location.hash
		if (hashStr != this.lastHash)
		{
			this.lastHash = hashStr
			var hash = hashStr.length > 1 ? UrlEncode.parse(hashStr) : null
			this.owner.controller.hashUpdated(hash)
		}
	},
	
	setHash: function (hash)
	{
		this.lastHash = location.hash = UrlEncode.stringify(hash)
	},
	
	modelChanged: function (data, state)
	{
		this.renderBars(data, state)
	},
	
	_setViewNum: function (num)
	{
		var type = ['list','map'][num]
		this.setViewType(type)
		this.owner.controller.viewTypeSwitched(type)
	},
	
	setViewType: function (type)
	{
		this.nodes.viewSwitcher.select(type)
	},
	
	renderCities: function (options, selected)
	{
		var node = this.nodes.citySelect
		node.setOptions(options)
		node.select(selected || 0, true)
	},
	
	renderFormats: function (options, selected)
	{
		var node = this.nodes.formatSelect
		options.unshift(this.any.format)
		node.setOptions(options)
		node.select(selected || 0, true)
	},
	
	renderFeels: function (options, selected)
	{
		var node = this.nodes.feelSelect
		options.unshift(this.any.feel)
		node.setOptions(options)
		node.select(selected || 0, true)
	},
	
	renderBars: function (bars, state)
	{
		if (!state.view || state.view == 'list')
			return this.renderBarsList(bars, state)
		else if (state.view == 'map')
			return this.renderBarsMap(bars, state)
		else
			log('Unknown view type "'+state.view+'"')
	},
	renderBarsList: function (bars, state)
	{
		this.waitGMap(null)
		
		var parent = this.nodes.barsContainer
		parent.empty()
		for (var i = 0; i < bars.length; i++)
		{
			var bar = bars[i]
			var node = this.getBarNode(bar)
			parent.appendChild(node)
			parent.appendChild(document.createTextNode(' '))
		}
	},
	renderBarsMap: function (bars, state)
	{
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
				var cityData = this.citiesDB.getByName(state.city)
				var cityPoint = cityData.point
				lat = cityPoint[0]
				lng = cityPoint[1]
				zoom = cityData.zoom || 10
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
			GEvent.addListener(map, 'moveend', function () { me.owner.controller.gMapMoveEnd(map.getCenter(), map.getZoom()) })
			this.gMap = map
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
	
	getGMarker: function (bar)
	{
		var gPoint = new GLatLng(bar.point[0], bar.point[1])
		// var mkey = bar.point[0] + ':' + bar.point[1]
		var gMarker = new GMarker(gPoint, {icon: this.gIcon})
		var me = this
		function click () { me.owner.controller.gMarkerClicked(gMarker) }
		GEvent.addListener(gMarker, 'click', click)
		gMarker.bar = bar
		bar.gMarker = gMarker
		return gMarker
	},
	
	showBarMapPopup: function (bar)
	{
		bar.gMarker.openInfoWindowHtml('<div class="bar-map-popup"><h2>'+bar.name+'</h2><p>'+bar.address+'</p><a href="'+bar.pageHref()+'">Посмотреть бар…</a></div>')
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
	},
	
	getBarHref: function (bar) { return '/bars/' + bar.city.trans().htmlName() + '/' + bar.name_eng.htmlName() + '.html' },
	getBarImageSrc: function (bar) { return '/i/bar/'+bar.city.trans().htmlName() + '/' + bar.name_eng.htmlName() + '-mini.png' }
}

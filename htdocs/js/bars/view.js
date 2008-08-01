BarsPage.view =
{
	owner: BarsPage,
	cache: {barNode:{}},
	any: {format: 'любой формат', feel: 'любая атмосфера'},
	
	initialize: function (nodes, citiesDB)
	{
		this.citiesDB = citiesDB
		this.nodes = nodes
		var me = this
		var controller = me.owner.controller
		nodes.citySelect.onselect	= function (val) { controller.citySelected(val) }
		nodes.formatSelect.onselect = function (val) { controller.formatSelected(val == me.any.format ? undefined : val) }
		nodes.feelSelect.onselect	= function (val) { controller.feelSelected(val == me.any.feel ? undefined : val) }
		nodes.viewSwitcher.onselect = function (num) { me._setViewNum(num) }
		nodes.viewSwitcher.setTabs([this.nodes.barsContainer, this.nodes.map])
		nodes.viewSwitcher.setNames(['list', 'map'])
		// nodes.viewSwitcher.autoSelect = false
		// this.initMap()
	},
	
	modelChanged: function (data, state)
	{
		this.renderBars(data, state)
	},
	
	initMap: function ()
	{
		var me = this
		if (!window.GMap2)
		{
			if (this.gMapTimer)
				return
			
			this.gMapTimer = setTimeout(function () {  })
		}
		
		
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
			GEvent.addListener(map, 'moveend', function () { me.owner.controller.gMapMoveEnd(this) })
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
		
		var map = this.gMap
		
		if (this.lastCity != state.city)
		{
			var ll, zoom
			if (!this.lastCity && state.lat && state.lng)
			{
				ll = new GLatLng(parseFloat(state.lat), parseFloat(state.lng))
				zoom = parseInt(state.zoom) || 10
			}
			else
			{
				var cityData = this.citiesDB.getByName(state.city)
				var cityPoint = cityData.point
				ll = new GLatLng(cityPoint[0],cityPoint[1])
				zoom = cityData.zoom || 10
			}
			
			map.setCenter(ll, zoom)
			this.lastCity = state.city
		}
		map.clearOverlays()
		parent.innerHTML = ''
		for (var i = 0; i < bars.length; i++)
		{
			var bar = bars[i]
			if (!bar.gMarker)
				bar.gMarker = this.getGMarker(bar)
			map.addOverlay(bar.gMarker)
		}
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
		bar.gMarker.openInfoWindowHtml('<div class="bar-map-popup"><h2>'+bar.name+'</h2><p>'+bar.address+'</p><a href="'+this.getBarHref(bar)+'">Посмотреть бар…</a></div>') // <img src="'+me.getBarImageSrc(bar)+'"/>
	},
	
	getBarNode: function (bar)
	{
		var main = this.cache.barNode[bar.id] || (this.cache.barNode[bar.id] = this.createBarNode(bar))
		main.setName(bar.name)
		main.setImage(this.getBarImageSrc(bar))
		main.setHref(this.getBarHref(bar))
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
	
	getBarHref: function (bar) { return '/bars/' + bar.id + '.html' },
	getBarImageSrc: function (bar) { return '/i/bar/pre/' + bar.id + '.jpg' }
}

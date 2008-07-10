var BarsView =
{
	cache: {barNode:{}},
	citiesData:
	{
		'Москва': {point: [55.790473,37.619934], zoom: 10},
		'Санкт-Петербург': {point: [59.941084,30.315914], zoom: 10},
		'Омск': {point: [54.990222,73.394165], zoom: 11}
	},
	
	any: {format: 'любой формат', feel: 'любая атмосфера'},
	
	initialize: function (nodes)
	{
		this.nodes = nodes
		var self = this
		nodes.citySelect.onselect	= function (val) { BarsController.citySelected(val) }
		nodes.formatSelect.onselect = function (val) { BarsController.formatSelected(val == self.any.format ? null : val) }
		nodes.feelSelect.onselect	= function (val) { BarsController.feelSelected(val == self.any.feel ? null : val) }
		nodes.viewSwitcher.onselect = function (num) { self._setViewNum(num) }
		nodes.viewSwitcher.setTabs([this.nodes.barsContainer, this.nodes.map])
		nodes.viewSwitcher.setNames(['list', 'map'])
		// nodes.viewSwitcher.autoSelect = false
		
		this.nodes.map.show()
		var map = new GMap2(this.nodes.map)
		this.nodes.map.hide()
		map.addControl(new GSmallMapControl())
		map.enableContinuousZoom()
		map.enableScrollWheelZoom()
		GEvent.addListener(map, 'moveend', function () { BarsController.gMapMoveEnd(this) })
		this.gMap = map
		
		var gIcon = new GIcon()
		gIcon.shadow = '/t/bg/bars/bar-icon.png'
		gIcon.image = '/t/bg/bars/bar-icon.png'
		gIcon.iconAnchor = new GPoint(12, 34)
		gIcon.infoWindowAnchor = new GPoint(16, 0)
		gIcon.infoShadowAnchor = new GPoint(18, 25)
		this.gIcon = gIcon
	},
	
	modelChanged: function (data, state)
	{
		this.renderBars(data, state)
	},
	
	_setViewNum: function (num)
	{
		var type = ['list','map'][num]
		this.setViewType(type)
		BarsController.viewTypeSwitched(type)
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
		if (state.view == 'list')
			return this.renderBarsList(bars, state)
		else if (state.view == 'map')
			return this.renderBarsMap(bars, state)
		else
			xxx
	},
	renderBarsList: function (bars, state)
	{
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
				var cityData = this.citiesData[state.city]
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
		var _this = this
		function click ()
		{
			BarsController.gMarkerClicked(gMarker)
		}
		GEvent.addListener(gMarker, 'click', click)
		gMarker.bar = bar
		bar.gMarker = gMarker
		return gMarker
	},
	
	showBarMapPopup: function (bar)
	{
		bar.gMarker.openInfoWindowHtml('<div class="bar-map-popup"><h2>'+bar.name+'</h2><p>'+bar.address+'</p><a href="'+this.getBarHref(bar)+'">Посмотреть бар…</a></div>') // <img src="'+_this.getBarImageSrc(bar)+'"/>
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

var BarsView =
{
	cache: {barNode:{}},
	citiesData:
	{
		'Москва': {point: [55.790473,37.619934]},
		'Санкт-Петербург': {point: [59.941084,30.315914]},
		'Омск': {point: [54.990222,73.394165]}
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
		nodes.viewSwitcher.autoSelect = false
		
		this.nodes.map.show()
		var map = new GMap2(this.nodes.map)
		this.nodes.map.hide()
		map.addControl(new GSmallMapControl())
		map.enableContinuousZoom()
		map.enableScrollWheelZoom()
		map.moveend = function () { alert('moveend') }
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
	
	_setViewNum: function (num) { return this.setViewType(['list','map'][num]) },
	
	setViewType: function (type)
	{
		this.nodes.viewSwitcher.select(type)
		BarsController.viewTypeSwitched(type)
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
			var cityPoint = this.citiesData[state.city].point
			map.setCenter(new GLatLng(cityPoint[0],cityPoint[1]), 10)
			this.lastCity = state.city
		}
		map.clearOverlays()
		// vac.gMarker.openInfoWindowHtml('<div class="info-window-popup"><div class="logo">' + vac.brand + '</div><div class="type">' + vac.type + '</div></div>')
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
		GEvent.addListener(gMarker, 'click', function () { alert('click') })
		return gMarker
	},
	
	getBarNode: function (bar)
	{
		var main = this.cache.barNode[bar.id] || (this.cache.barNode[bar.id] = this.createBarNode(bar))
		main.setName(bar.name)
		main.setImage('/i/bar/pre/'+bar.id+'.jpg')
		main.setHref('/bars/'+bar.id+'.html')
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

var BarsView =
{
	cache: {barNode:{}},
	viewType: 'list',
	citiesData:
	{
		'Москва': {point: [55.790473,37.619934]},
		'Санкт-Петербург': {point: [59.941084,30.315914]},
		'Омск': {point: [54.990222,73.394165]}
	},
	
	initialize: function (nodes)
	{
		this.nodes = nodes
		nodes.citySelect.onselect	= function (val) { BarsController.citySelected(val) }
		nodes.formatSelect.onselect = function (val) { BarsController.formatSelected(val) }
		nodes.feelSelect.onselect	= function (val) { BarsController.feelSelected(val) }
		nodes.viewSwitcher.onselect = function (num) { BarsController.viewSwitched(['list','map'][num]) }
		
		this.nodes.map.show()
		var map = new GMap2(this.nodes.map)
		this.nodes.map.hide()
		map.addControl(new GSmallMapControl())
		map.enableContinuousZoom()
		map.enableScrollWheelZoom()
		this.gMap = map
		
		var gIcon = new GIcon()
		gIcon.shadow = '/t/map-dollar-shadow.png'
		gIcon.image = '/t/map-dollar.gif'
		gIcon.iconAnchor = new GPoint(12, 34)
		gIcon.infoWindowAnchor = new GPoint(16, 0)
		gIcon.infoShadowAnchor = new GPoint(18, 25)
		this.gIcon = gIcon
	},
	
	modelChanged: function (data)
	{
		this.renderBars(data)
	},
	
	setViewType: function (type)
	{
		this.viewType = type
	},
	
	renderCities: function (options)
	{
		var node = this.nodes.citySelect
		node.setOptions(options)
		node.select(0)
	},
	
	renderFormats: function (options)
	{
		var node = this.nodes.formatSelect
		node.setOptions(options)
		node.select(0, true)
	},
	
	renderFeels: function (options)
	{
		var node = this.nodes.feelSelect
		node.setOptions(options)
		node.select(0, true)
	},
	
	renderBars: function (bars)
	{
		if (this.viewType == 'list')
			return this.renderBarsList(bars)
		else if (this.viewType == 'map')
			return this.renderBarsMap(bars)
		else
			throw new Error('Unknown viewType "' + this.viewType + '"')
	},
	renderBarsList: function (bars)
	{
		var parent = this.nodes.barsContainer
		parent.innerHTML = ''
		for (var i = 0; i < bars.length; i++)
		{
			var bar = bars[i]
			var node = this.getBarNode(bar)
			parent.appendChild(node)
			parent.appendChild(document.createTextNode(' '))
		}
	},
	renderBarsMap: function (bars)
	{
		var map = this.gMap
		log(bars.city)
		var cityPoint = this.citiesData[bars.city].point
		map.setCenter(new GLatLng(cityPoint[0],cityPoint[1]), 10)
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
		var gMarker = new GMarker(gPoint)
		GEvent.addListener(gMarker, 'click', function () { alert('click') })
		return gMarker
	},
	
	getBarNode: function (bar)
	{
		
		var main = this.cache.barNode[bar.name] || (this.cache.barNode[bar.name] = this.createBarNode(bar))
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
		// main.data = {name:name}
		main.setImage = function (src) { main.style.backgroundImage = 'url('+src+')' }
		main.setName = function (text) { name.innerHTML = text }
		main.setHref = function (href) { name.href = href }
		return main
	}
}

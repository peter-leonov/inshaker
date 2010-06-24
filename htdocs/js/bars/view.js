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
		
		var me = this
		
		var ts = this.viewTypeSwitcher = new TabSwitcher()
		ts.bind({tabs: nodes.viewSwitcherButtons, sections:[this.nodes.barsContainer, this.nodes.map]})
		ts.addEventListener('select', function (e) { me.setViewNum(e.data.value) }, false)
		
		var s = this.formatSelecter = new Selecter()
		s.bind(nodes.formatSelecter)
		s.addEventListener('select', function (e) { controller.formatSelected(e.data.value) }, false)
		
		var s = this.feelSelecter = new Selecter()
		s.bind(nodes.feelSelecter)
		s.addEventListener('select', function (e) { controller.feelSelected(e.data.value) }, false)
		
		var s = this.citySelecter = new Selecter()
		s.bind(nodes.citySelecter)
		s.addEventListener('select', function (e) { controller.citySelected(e.data.value) }, false)
		
		nodes.titleSearchAll.addEventListener('mousedown', function () { controller.showAllBars({}) }, false)
		
		nodes.moreInfo.addEventListener('click', function (e) { nodes.guidePopup.show() }, false)
		nodes.guidePopup.addEventListener('click', function (e) { nodes.guidePopup.hide() }, false)
		nodes.guidePopupBody.addEventListener('click', function (e) { e.stopPropagation() }, false)
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
	
	setViewNum: function (type)
	{
		this.setViewType(type)
		this.controller.viewTypeSwitched(type)
	},
	
	setViewType: function (type)
	{
		this.viewTypeSwitcher.renderSelected(type)
	},
	
	renderCities: function (options, selected)
	{
		var s = this.citySelecter
		s.setOptions(options)
		if (selected)
			s.renderSelectedValue(selected)
		else
			s.renderSelected(0)
	},
	
	renderFormats: function (options, selected)
	{
		var s = this.formatSelecter
		s.setOptions(options)
		if (selected)
			s.renderSelectedValue(selected)
		else
			s.renderSelected(0)
	},
	
	renderFeels: function (options, selected)
	{
		var s = this.feelSelecter
		s.setOptions(options)
		if (selected)
			s.renderSelectedValue(selected)
		else
			s.renderSelected(0)
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
			bars = data.bars
		
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
		
		this.initMap()
		var map = this.map
		
		if (this.lastCity != state.city)
		{
			var lat, lng, zoom
			if (!this.lastCity && state.lat && state.lng)
			{
				lat = parseFloat(state.lat)
				lng = parseFloat(state.lng)
				zoom = parseInt(state.zoom) || 10
			}
			else if (state.bar)
			{
				var point = state.bar.point
				lat = point[0]
				lng = point[1]
				zoom = 13
			}
			else
			{
				var point = city.point
				lat = point[0]
				lng = point[1]
				zoom = city.zoom || 10
			}
			
			
			map.setCenter({lat: lat, lng: lng}, zoom)
			this.lastCity = state.city
		}
		
		var points = []
		for (var i = 0; i < bars.length; i++)
			points[i] = this.getBarPoint(bars[i])
		map.setPoints(points)
		
		// if (state.bar)
		// 	this.showBarMapPopup(state.bar)
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
		if (this.map)
			return
		
		var map = this.map = new Map(),
			nodes = this.nodes
		
		map.bind({main: nodes.mapSurface, wrapper: nodes.map, control: nodes.positionControl})
		map.addEventListener('pointInvoked', function (e) { log(e) }, false)
	},
	
	getBarPoint: function (bar)
	{
		return new BarPoint(bar)//{latlng: {lat: bar.point[0], lng: bar.point[1]}}
	},
	
	showBarMapPopup: function (bar)
	{
		var contacts, body = ''
		if ((contacts = bar.contacts))
		{
			body = contacts.address
			if (contacts.tel)
				body += '<br/>' + contacts.tel + '</a>'
		}
		bar.gMarker.openInfoWindowHtml('<div class="bar-map-popup"><h2><a href="' + bar.pageHref() + '">' + bar.name + '</a></h2><p>' + body + '</p></div>')
	},
	
	renderTitle: function (cocktail)
	{
		var nodes = this.nodes
		if (cocktail)
		{
			nodes.titleAll.hide()
			nodes.titleSearch.show()
			var nameNode = nodes.titleSearchName
			nameNode.innerHTML = cocktail.nameVP || cocktail.name
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
		var main = document.createElement('li'),
			nameCont = document.createElement('a'),
			name = document.createElement('span')
		
		name.className = 'bar-name'
		name.innerHTML = bar.name
		
		nameCont.appendChild(name)
		main.appendChild(nameCont)
		
		main.className = 'bar-mini'
		main.setImage = function (src) { main.style.backgroundImage = 'url('+src+')' }
		main.setName = function (text) { name.innerHTML = text }
		main.setHref = function (href) { nameCont.href = href }
		
		if (bar.labelType == 'new')
		{
			var label = document.createElement('span')
			label.className = 'label'
			label.innerHTML  = 'Бар недавно открылся, заходи посмотреть!'
			nameCont.appendChild(label)
			main.addClassName(bar.labelType)
		}
		
		return main
	}
}

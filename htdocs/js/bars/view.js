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
		nodes.formatSelect.onselect = function (val) { controller.formatSelected(val) }
		nodes.feelSelect.onselect   = function (val) { controller.feelSelected(val) }
		nodes.citySelect.onselect   = function (val) { controller.citySelected(val) }
		Switcher.bind(nodes.viewSwitcher, nodes.viewSwitcherButtons, [this.nodes.barsContainer, this.nodes.map])
		nodes.viewSwitcher.setNames(['list', 'map'])
		nodes.viewSwitcher.onselect = function (num) { me.setViewNum(num) }
		
		Selecter.bind(nodes.citySelect)
		Selecter.bind(nodes.formatSelect)
		Selecter.bind(nodes.feelSelect)
		
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
	
	setViewNum: function (num)
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
		var node = this.nodes.citySelect
		node.setOptions(options)
		node.select(selected || 0, true)
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
			if (bar == state.bar)
				this.showBarMapPopup(bar)
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
			var map = new GMap2(this.nodes.mapSurface)
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

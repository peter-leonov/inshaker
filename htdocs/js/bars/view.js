function BarsPageView ()
{
	BarsPageView.name = 'BarsPageView'
	this.constructor = BarsPageView
	this.initialize.apply(this, arguments)
}

eval(NodesShortcut.include())

BarsPageView.prototype =
{
	initialize: function (controller, nodes)
	{
		this.controller = controller
		this.nodes = nodes
		this.cache = {barNode: {}}
		
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
	},
	
	checkHash: function ()
	{
		var hash, str
		
		if (str = location.hash.substr(1))
			hash = UrlEncode.parse(str)
		else if (str = WindowName.get('bars:state'))
			hash = UrlEncode.parse(str)
		else
			hash = {view: 'list'}
		
		this.controller.hashUpdated(hash)
	},
	
	setHash: function (hash)
	{
		var urledHash = UrlEncode.stringify(hash)
		location.hash = '#' + urledHash
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
		if (!type)
			type = 'list'
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
		
		
		var points = []
		for (var i = 0; i < bars.length; i++)
		{
			var bar = bars[i]
			bar.mapPoint = points[i] = new BarPoint(bar)
		}
		map.setPoints(points)
		
		var current = state.bar
		if (current && current.mapPoint)
		{
			var node = current.mapPoint.createNode()
			node.addClassName('selected')
		}
		
		if (this.lastCity != state.city)
		{
			var lat, lng, zoom
			if (!this.lastCity && state.lat && state.lng)
			{
				lat = parseFloat(state.lat)
				lng = parseFloat(state.lng)
				zoom = parseInt(state.zoom) || 10
			}
			else if (current)
			{
				var point = current.point
				lat = point[0]
				lng = point[1]
				zoom = 17
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
	},
	
	initMap: function ()
	{
		if (this.map)
			return
		
		var map = this.map = new Map(),
			nodes = this.nodes
		
		map.bind({main: nodes.mapSurface, wrapper: nodes.map, control: nodes.positionControl})
		var controller = this.controller
		map.addEventListener('moved', function (e) { controller.mapMoved(e.center, e.zoom) }, false)
	},
	
	renderTitle: function (cocktail, allBarsCount)
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
			nodes.titleAll.appendChild(T(allBarsCount + " " + allBarsCount.plural("лучший коктейльный бар", "лучших коктейльных бара", "лучших коктейльных баров") + " России"))
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

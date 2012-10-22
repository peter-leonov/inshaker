;(function(){

var UrlEncodeLight = {}
Object.extend(UrlEncodeLight, UrlEncode)
UrlEncodeLight.encode = function (v) { return ('' + v).replace('&', '%26').replace('=', '%3D') }
UrlEncodeLight.decode = function (v) { return ('' + v).replace('%26', '&').replace('%3D', '=') }


function Me ()
{
	this.cache = {barNode: {}}
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		
		var ts = this.viewTypeSwitcher = new TabSwitcher()
		ts.bind({tabs: nodes.viewSwitcherButtons, sections:[this.nodes.barsContainer, this.nodes.map]})
		ts.addEventListener('select', function (e) { me.setViewNum(e.data.value) }, false)
		
		
		var controller = this.controller
		
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
		
		var lh = this.locationHash = new LocationHash().bind()
		lh.addEventListener('change', function (e) { me.locationHashUpdated() }, false)
	},
	
	locationHashUpdated: function ()
	{
		var hash = this.locationHash.get()
		var state = hash ? UrlEncodeLight.parse(hash) : {view: 'list'}
		
		this.controller.hashUpdated(state)
	},
	
	setHash: function (hash)
	{
		this.locationHash.set(UrlEncodeLight.stringify(hash))
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
		var parent = this.nodes.barsContainer
		
		parent.empty()
		
		var bars = data.bars
		for (var i = 0; i < bars.length; i++)
			parent.appendChild(this.getBarNode(bars[i]))
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
			node.classList.add('selected')
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
			nodes.titleAll.root.hide()
			nodes.titleSearch.show()
			var nameNode = nodes.titleSearchName
			nameNode.innerHTML = cocktail.nameVP || cocktail.name
			nameNode.href = '/cocktails/' + cocktail.name_eng.htmlName() + '.html'
		}
		else
		{
			nodes.titleSearch.hide()
			nodes.titleAll.value.firstChild.nodeValue = allBarsCount
			nodes.titleAll.unit.firstChild.nodeValue = allBarsCount.plural('лучший коктейльный бар', 'лучших коктейльных бара', 'лучших коктейльных баров')
			nodes.titleAll.root.show()
		}
	},
	
	getBarNode: function (bar)
	{
		var barNode = this.cache.barNode
		
		var main = barNode[bar.id]
		if (main)
			return main
		
		main = barNode[bar.id] = this.createBarNode(bar)
		return main
	},
	
	createBarNode: function (bar)
	{
		var main = document.createElement('li')
		main.className = 'bar-mini'
		
		var nameCont = document.createElement('a')
		nameCont.style.backgroundImage = 'url(' + bar.smallImageHref() + ')'
		nameCont.href = bar.pageHref()
		main.appendChild(nameCont)
		
		var name = document.createElement('span')
		name.className = 'bar-name'
		name.appendChild(document.createTextNode(bar.name))
		nameCont.appendChild(name)
		
		if (bar.labelType == 'new')
		{
			var label = document.createElement('span')
			label.className = 'label'
			label.appendChild(document.createTextNode('Бар недавно открылся, заходи посмотреть!'))
			nameCont.appendChild(label)
			main.classList.add(bar.labelType)
		}
		
		return main
	}
}

Papa.View = Me

})();

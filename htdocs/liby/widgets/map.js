;(function(){

var Papa

;(function(){

function Me ()
{
	var m = this.model = new Me.Model(),
		v = this.view = new Me.View(),
		c = this.controller = new Me.Controller()
	
	m.view = v
	v.controller = c
	c.model = m
	
	m.parent = v.parent = c.parent = this
}

Me.prototype = 
{
	bind: function (nodes)
	{
		this.view.bind(nodes)
		return this
	},
	
	setCenter: function (center, zoom) { this.model.setCenter(center, zoom) },
	setPoints: function (points) { this.model.setPoints(points) },
	apiLoaded: function () { this.dispatchEvent('ready') }
}

Me.mixIn(EventDriven)

Me.className = 'Map'
self[Me.className] = Papa = Me


})();


;(function(){

function Me () {}
Papa.Overlay = Me

})();


;(function(){

eval(NodesShortcut.include())

function Me ()
{
	this.nodes = {}
	this.visibleMarkers = {}
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		if (!nodes.wrapper)
			nodes.wrapper = nodes.main
		
		var me = this
		googleApiLoader.addEventListener('maps', function (e) { me.apiLoaded(e) }, false)
		googleApiLoader.load('maps', 3, {other_params: "sensor=false&language=ru-RU"}) // shame on google.load()
		nodes.wrapper.classList.add('loading')
	},
	
	apiLoaded: function (e)
	{
		this.api = e.api
		this.updateOverlayProto()
		this.createMap()
		
		this.ready = true
		this.controller.apiLoaded()
	},
	
	createMap: function ()
	{
		var api = this.api
		
		var opts =
		{
			// center: new api.LatLng(this.center.lat, this.center.lng),
			// zoom: this.zoom,
			disableDefaultUI: true,
			mapTypeId: api.MapTypeId.ROADMAP
		}
		
		this.map = new api.Map(this.nodes.main, opts)
		
		var me = this
		this.api.event.addListener(this.map, 'dragend', function () { me.mapMoveEnd() })
		this.addControls()
		
		this.nodes.wrapper.classList.remove('loading')
	},
	
	setCenter: function (center, zoom)
	{
		if (!this.ready)
			return
		
		this.map.setCenter(new this.api.LatLng(center.lat, center.lng), zoom)
	},
	
	addControls: function ()
	{
		var nodes = this.nodes,
			control = nodes.control
		
		if (!control)
		{
			var api = this.api, controlPosition = new api.ControlPosition(api.ANCHOR_TOP_LEFT, new api.Size(10, 15))
			this.map.addControl(new api.SmallMapControl(), controlPosition)
			return
		}
		
		var main = nodes.main,
			map = this.map
		
		main.appendChild(control)
		
		var step = 100
		
		function move (e)
		{
			var action = e.target.getAttribute('data-map-action')
			
			switch (action)
			{
				case 'to-top':
				map.panDirection(0, 1)
				map.panBy(0, -step)
				break
				
				case 'to-right':
				map.panDirection(-1, 0)
				map.panBy(step, 0)
				break
				
				case 'to-bottom':
				map.panDirection(0, -1)
				map.panBy(0, step)
				break
				
				case 'to-left':
				map.panDirection(1, 0)
				map.panBy(-step, 0)
				break
				
				case 'to-plus':
				map.zoomIn()
				map.setZoom(map.getZoom() + 1)
				break
				
				case 'to-minus':
				map.zoomOut()
				map.setZoom(map.getZoom() - 1)
				break
			}
		}
		
		control.addEventListener('click', move, false)
	},
	
	updateOverlayProto: function ()
	{
		var proto = Papa.Overlay.prototype
		
		Object.extend(proto, new this.api.OverlayView())
		proto.api = this.api
	},
	
	mapMoveEnd: function ()
	{
		var center = this.map.getCenter(),
			bounds = this.map.getBounds(),
			sw = bounds.getSouthWest(),
			ne = bounds.getNorthEast()
		
		this.controller.moved({lat:center.lat(), lng:center.lng()}, this.map.getZoom(), {lat:sw.lat(), lng:sw.lng()}, {lat:ne.lat(), lng:ne.lng()})
	},
	
	renderPoints: function (points)
	{
		if (!this.ready)
			return
		
		var map = this.map,
			visible = this.visibleMarkers,
			now = this.visibleMarkers = {}
		
		for (var i = 0; i < points.length; i++)
		{
			var point = points[i], pid = point.mapPointId
			
			// get the marker and insert it into the new visibleMarkers hash
			now[pid] = point
			
			// add marker (and delete its record) only if it isn't already shown
			if (!visible[pid])
				point.setMap(map)
			else
				delete visible[pid]
		}
		
		// remove all the markers that are still visible
		for (var k in visible)
			visible[k].setMap(null)
	}
}

Papa.View = Me

})();


;(function(){

function Me () {}

Me.prototype = 
{
	moved: function (center, zoom, sw, ne)
	{
		this.parent.dispatchEvent({type:'moved', center:center, zoom:zoom, sw:sw, ne:ne})
	},
	
	apiLoaded: function () { this.model.apiLoaded(); this.parent.apiLoaded() }
}

Papa.Controller = Me

})();


;(function(){

function Me ()
{
	this.points = []
	this.count = 0
}

Me.prototype =
{
	apiLoaded: function ()
	{
		this.view.setCenter(this.center, this.zoom)
		this.view.renderPoints(this.points)
	},
	
	setCenter: function (center, zoom)
	{
		this.center = center
		this.zoom = zoom
		this.view.setCenter(center, zoom)
	},
	
	setPoints: function (points)
	{
		if (!this.parent.dispatchEvent({type:'pointsSet', points: points}))
			return
		
		var count = this.count
		for (var i = 0, il = points.length; i < il; i++)
		{
			var point = points[i]
			if (!point.mapPointId)
				point.mapPointId = ++count
		}
		this.count = count
		
		this.points = points
		this.view.renderPoints(points)
	}
}

Papa.Model = Me

})();


})();
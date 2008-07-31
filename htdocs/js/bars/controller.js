BarsPage.controller =
{
	owner: BarsPage,
	
	state: {city: undefined, format: undefined, feel: undefined},
	
	initialize: function (db, state)
	{
		this.state = state
		if (location.hash.length > 1)
			Object.extend(this.state, UrlEncode.parse(location.hash))
		
		this.owner.model.initialize(db, this.state)
		
		this.owner.view.setViewType(this.state.view)
		this.owner.model.setState(this.state)
	},
	
	gMarkerClicked: function (gMarker)
	{
		this.owner.view.showBarMapPopup(gMarker.bar)
	},
	
	gMapMoveEnd: function (map)
	{
		var gLatLng = map.getCenter()
		var gZoom = map.getZoom()
		this.state.zoom = gZoom
		this.state.lat = Math.round(gLatLng.lat() * 10000) / 10000
		this.state.lng = Math.round(gLatLng.lng() * 10000) / 10000
		this.setHash(this.state)
	},
	
	viewTypeSwitched: function (type)
	{
		this.state.view = type
		this.setHash(this.state)
		this.owner.model.setState(this.state)
	},
	
	setHash: function (hash)
	{
		location.hash = UrlEncode.stringify(hash)
	},
	
	citySelected: function (val)
	{
		this.state.city = val
		this.state.format = undefined
		this.state.feel = undefined
		this.setHash(this.state)
		this.owner.model.setState(this.state)
	},
	formatSelected: function (val)
	{
		this.state.format = val
		this.state.feel = undefined
		this.setHash(this.state)
		this.owner.model.setState(this.state)
	},
	feelSelected: function (val)
	{
		this.state.feel = val
		this.setHash(this.state)
		this.owner.model.setState(this.state)
	}
}


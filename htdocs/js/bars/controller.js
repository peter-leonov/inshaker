function BarsPageController ()
{
	BarsPageController.name = "BarsPageController"
	this.constructor = BarsPageController
	this.initialize.apply(this, arguments)
}

BarsPageController.prototype =
{
	state: {city: undefined, format: undefined, feel: undefined},
	
	initialize: function (state)
	{
		this.state = Object.copy(state)
		this.emptyState = Object.copy(state)
	},
	
	hashUpdated: function (hash)
	{
		var state = this.state
		if (hash)
			Object.extend(state, hash)
		else
			state = this.state = Object.copy(this.emptyState)
		
		this.view.setHash(state)
		this.view.setViewType(state.view)
		this.model.setState(state)
	},
	
	gMarkerClicked: function (gMarker)
	{
		this.view.showBarMapPopup(gMarker.bar)
	},
	
	gMapMoveEnd: function (ll, zoom)
	{
		var state = this.state
		state.zoom = zoom
		state.lat = Math.round(ll.lat() * 10000) / 10000
		state.lng = Math.round(ll.lng() * 10000) / 10000
		this.view.setHash(state)
	},
	
	showAllBars: function ()
	{
		this.cocktailSelected()
	},
	
	viewTypeSwitched: function (type)
	{
		this.state.view = type
		this.view.setHash(this.state)
		this.model.setState(this.state)
	},
	
	cocktailSelected: function (val)
	{
		var state = this.state
		state.cocktail = val
		state.city = state.format = state.feel = undefined
		this.view.setHash(state)
		this.model.setState(state)
	},
	citySelected: function (val)
	{
		var state = this.state
		state.city = val
		state.format = undefined
		state.feel = undefined
		this.view.setHash(state)
		this.model.setState(state)
	},
	formatSelected: function (val)
	{
		var state = this.state
		state.format = val
		state.feel = undefined
		this.view.setHash(state)
		this.model.setState(state)
	},
	feelSelected: function (val)
	{
		this.state.feel = val
		this.view.setHash(this.state)
		this.model.setState(this.state)
	}
}


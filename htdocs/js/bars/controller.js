BarsPage.controller =
{
	owner: BarsPage,
	
	state: {city: undefined, format: undefined, feel: undefined},
	
	initialize: function (barsDB, cocktailsDB, state)
	{
		this.state = Object.copy(state)
		this.emptyState = Object.copy(state)
		this.owner.model.initialize(barsDB, cocktailsDB)
	},
	
	hashUpdated: function (hash)
	{
		var state = this.state
		if (hash)
			Object.extend(state, hash)
		else
			state = this.state = Object.copy(this.emptyState)
		// log(hash, state)
		var owner = this.owner
		owner.view.setViewType(state.view)
		owner.model.setState(state)
	},
	
	gMarkerClicked: function (gMarker)
	{
		this.owner.view.showBarMapPopup(gMarker.bar)
	},
	
	gMapMoveEnd: function (ll, zoom)
	{
		var state = this.state
		state.zoom = zoom
		state.lat = Math.round(ll.lat() * 10000) / 10000
		state.lng = Math.round(ll.lng() * 10000) / 10000
		this.owner.view.setHash(state)
	},
	
	showAllBars: function ()
	{
		this.cocktailSelected()
	},
	
	viewTypeSwitched: function (type)
	{
		this.state.view = type
		this.owner.view.setHash(this.state)
		this.owner.model.setState(this.state)
	},
	
	cocktailSelected: function (val)
	{
		var state = this.state,
			owner = this.owner
		
		state.cocktail = val
		state.city = state.format = state.feel = undefined
		owner.view.setHash(state)
		owner.model.setState(state)
	},
	citySelected: function (val)
	{
		this.state.city = val
		this.state.format = undefined
		this.state.feel = undefined
		this.owner.view.setHash(this.state)
		this.owner.model.setState(this.state)
	},
	formatSelected: function (val)
	{
		this.state.format = val
		this.state.feel = undefined
		this.owner.view.setHash(this.state)
		this.owner.model.setState(this.state)
	},
	feelSelected: function (val)
	{
		this.state.feel = val
		this.owner.view.setHash(this.state)
		this.owner.model.setState(this.state)
	}
}


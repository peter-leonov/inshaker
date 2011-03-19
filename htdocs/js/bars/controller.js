function BarsPageController ()
{
	BarsPageController.name = "BarsPageController"
	this.constructor = BarsPageController
}

BarsPageController.prototype =
{
	hashUpdated: function (hash)
	{
		var state = this.state = hash
		
		this.view.setHash(state)
		this.view.setViewType(state.view)
		this.model.setState(state)
	},
	
	mapMoved: function (ll, zoom)
	{
		var state = this.state
		state.zoom = zoom
		state.lat = Math.round(ll.lat * 10000) / 10000
		state.lng = Math.round(ll.lng * 10000) / 10000
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
		delete state.bar
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


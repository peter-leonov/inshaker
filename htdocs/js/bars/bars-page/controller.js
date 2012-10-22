;(function(){

function Me () {}

Me.prototype =
{
	hashUpdated: function (hash)
	{
		var state = this.state = hash
		
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
		var state = this.state
		state.view = type
		if (type == 'list')
		{
			delete state.zoom
			delete state.lat
			delete state.lng
		}
		this.view.setHash(state)
		this.model.setState(state)
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
		delete state.format
		delete state.feel
		this.view.setHash(state)
		this.model.setState(state)
	},
	formatSelected: function (val)
	{
		var state = this.state
		state.format = val
		delete state.feel
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

Papa.Controller = Me

})();

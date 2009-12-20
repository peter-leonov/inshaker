BarPage.controller =
{
	owner: null, // must be defined before initialize
	
	initialize: function ()
	{
		
	},
	
	barCityNamesLoaded: function (state)
	{
		this.cityName = state.city
		this.barName = state.name
		this.owner.model.setQuery(state)
	},
	
	gMarkerClicked: function (gMarker)
	{
		var view = this.owner.view
		if (gMarker.bar.city == this.cityName && gMarker.bar.name == this.barName)
			view.showMainBarMapPopup(gMarker.bar)
		else
			view.showBarMapPopup(gMarker.bar)
	},
	
	toggleMoreClicked: function ()
	{
		this.owner.view.toggleMore()
	},
	
	moreIsMaximized: function () {  },
	moreIsMinimized: function () {  }
}
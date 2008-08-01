BarPage.controller =
{
	owner: null, // must be defined before initialize
	
	initialize: function ()
	{
		
	},
	
	barCityNamesLoaded: function (barId, cityName)
	{
		this.cityName = cityName
		this.barId = barId
		this.owner.model.setBarCity(barId, cityName)
	},
	
	gMarkerClicked: function (gMarker)
	{
		var view = this.owner.view
		if (gMarker.bar.id == this.barId)
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
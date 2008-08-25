BarPage.controller =
{
	owner: null, // must be defined before initialize
	
	initialize: function ()
	{
		
	},
	
	barCityNamesLoaded: function (barName, cityName)
	{
		this.cityName = cityName
		this.barName = barName
		this.owner.model.setBarCity(barName, cityName)
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
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
	
	toggleMoreClicked: function ()
	{
		this.owner.view.toggleMore()
	},
	
	moreIsMaximized: function () {  },
	moreIsMinimized: function () {  }
}
;(function(){

function Me () {}

Me.prototype =
{
	barCityNamesLoaded: function (state)
	{
		this.cityName = state.city
		this.barName = state.name
		this.model.setQuery(state)
	},
	
	moreIsMaximized: function () {  },
	moreIsMinimized: function () {  }
}

Papa.Controller = Me

})();

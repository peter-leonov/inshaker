function BarsPageModel ()
{
	BarsPageModel.name = "BarsPageModel"
	this.constructor = BarsPageModel
	this.initialize.apply(this, arguments)
}

BarsPageModel.prototype =
{
	initialize: function () { },
	
	setState: function (state)
	{
		state = Object.copy(state)
		
		var cities = Bar.getCities(state)
		if (!state.city)
			state.city = cities[0]
		
		if (state.bar)
			state.bar = Bar.getByCityName(state.city, state.bar)
		
		var barsSet = Bar.getByQuery(state)
		
		var city = City.getByName(state.city)
		var view = this.view
		view.modelChanged({bars: barsSet, state: state, city: city})
		view.renderTitle(Cocktail.getByName(state.cocktail))
		view.renderCities(cities, state.city)
		view.renderFormats(Bar.getFormats(state), state.format)
		view.renderFeels(Bar.getFeels(state), state.feel)
	}
}

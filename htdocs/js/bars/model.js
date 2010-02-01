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
		
		var now = new Date(), hYearMs = 3600 * 24 * (366 / 2) * 1000,
			neo = [], alphabical = [], future = []

		
		for (var i = 0, il = barsSet.length; i < il; i++)
		{
			var bar = barsSet[i]
			var openDate = (bar.openDate == undefined || bar.openDate == '') ? -1 : (now - new Date(bar.openDate)) // 0 is for Unix epoch begin
			if (openDate < 0) //// fill bars what opened in future
			{
				bar.labelType = 'future'
				future.push(bar)
			}
			else if (openDate < hYearMs) //// fill new bars
			{
				bar.labelType = 'new'
				neo.push(bar)
			}
			else //// other bars are neither 'new' nor 'future'
			{
				alphabical.push(bar)
			}
		}
		barsSet = neo.concat(alphabical, future)
		
		
		var city = City.getByName(state.city)
		var view = this.view
		view.modelChanged({bars: barsSet, state: state, city: city})
		view.renderTitle(Cocktail.getByName(state.cocktail))
		view.renderCities(cities, state.city)
		view.renderFormats(Bar.getFormats(state), state.format)
		view.renderFeels(Bar.getFeels(state), state.feel)
	}
}

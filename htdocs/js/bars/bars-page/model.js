;(function(){

function Me () {}

Me.prototype =
{
	setState: function (state)
	{
		state = Object.copy(state)
		
		var cities = Bar.getCities(state)
		cities.unshift('Россия')
		if (!state.city)
			state.city = cities[0]
		
		if (state.bar)
			state.bar = Bar.getByCityName(state.city, state.bar)
		
		var barsSet = Bar.getByQuery(state)
		
		var now = new Date(), bestBefore = 3600 * 24 * (366 / 4) * 1000,
			neo = [], normal = [], future = []
		
		for (var i = 0, il = barsSet.length; i < il; i++)
		{
			var bar = barsSet[i]
			var timeDiff = now - bar.openDate
			if (timeDiff < 0) // bars comming soon
			{
				bar.labelType = 'future'
				future.push(bar)
			}
			else if (timeDiff < bestBefore) // just opened
			{
				bar.labelType = 'new'
				neo.push(bar)
			}
			else // old bars
			{
				normal.push(bar)
			}
		}
		barsSet = neo.concat(normal, future)
		
		var city = City.getByName(state.city)
		var view = this.view
		view.modelChanged({bars: barsSet, state: state, city: city})
		view.renderTitle(Cocktail.getByName(state.cocktail), Bar.getCount())
		view.renderCities(cities, state.city)
		view.renderFormats(Bar.getFormats(state), state.format)
		view.renderFeels(Bar.getFeels(state), state.feel)
	}
}

Papa.Model = Me

})();

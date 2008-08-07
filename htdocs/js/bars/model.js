BarsPage.model =
{
	owner: BarsPage,
	
	initialize: function (barsDB, cocktailsDB)
	{
		this.barsDB = barsDB
		this.cocktailsDB = cocktailsDB
	},
	
	setState: function (state)
	{
		state = Object.copy(state)
		
		var view = this.owner.view,
			barsDB = this.barsDB,
			cocktailsDB = this.cocktailsDB
		
		var cities = barsDB.getCities(state)
		if (!state.city)
			state.city = cities[0]
		
		var barsSet = this.barsDB.getByQuery(state)
		
		view.modelChanged(barsSet, state)
		view.renderTitle(cocktailsDB.getByName(state.cocktail))
		view.renderCities(cities, state.city)
		view.renderFormats(barsDB.getFormats(state), state.format)
		view.renderFeels(barsDB.getFeels(state), state.feel)
	}
}

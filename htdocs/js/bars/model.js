BarsPage.model =
{
	owner: BarsPage,
	
	initialize: function (barsDB, cocktailsDB, state)
	{
		this.barsDB = barsDB
		this.cocktailsDB = cocktailsDB
		this.setState(state)
	},
	
	setState: function (state)
	{
		var barsSet = this.barsDB.getByState(state),
			view = this.owner.view,
			barsDB = this.barsDB,
			cocktailsDB = this.cocktailsDB
		
		var cocktail = cocktailsDB.getByName(state.cocktail)
		view.renderTitle(cocktail)
		view.modelChanged(barsSet, state)
		view.renderCities(barsDB.getCities(), state.city)
		
		view.renderFormats(barsDB.getFormats(state), state.format)
		view.renderFeels(barsDB.getFeels(state), state.feel)
	}
}

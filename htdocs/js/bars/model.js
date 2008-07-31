BarsPage.model =
{
	owner: BarsPage,
	
	initialize: function (barsDB, state)
	{
		this.barsDB = barsDB
		this.setState(state)
	},
	
	setState: function (state)
	{
		var barsSet = this.barsDB.getByState(state),
			view = this.owner.view,
			barsDB = this.barsDB
		
		view.modelChanged(barsSet, state)
		view.renderCities(barsDB.getCities(), state.city)
		view.renderFormats(barsDB.getFormatsByCity(state.city), state.format)
		view.renderFeels(barsDB.getFeelsByCityFormat(state.city, state.format), state.feel)
	}
}

EventPage.model =
{
	owner: null, // must be defined before initialize
	
	initialize: function (eventsDB)
	{
		this.eventsDB = eventsDB
	},
	
	setState: function (state)
	{
		var event = this.eventsDB.getByName(state.name)
		event.name = state.name
		
		this.owner.view.modelChanged(event)
	}
}
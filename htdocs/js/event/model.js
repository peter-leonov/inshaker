EventPage.model =
{
	owner: null, // must be defined before initialize
	
	initialize: function (eventsDB)
	{
		this.eventsDB = eventsDB
	},
	
	setState: function (state)
	{
		var db = this.eventsDB,
			event = db.getByName(state.name)[0],
			all = db.getByType(event.type)
		
		this.owner.view.modelChanged(event, all)
	}
}
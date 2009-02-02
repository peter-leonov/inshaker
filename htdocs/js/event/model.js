EventPage.model =
{
	owner: null, // must be defined before initialize
	
	initialize: function (eventsDB, filters)
	{
		this.eventsDB = eventsDB
		var event = null
		if(filters && filters.event && filters.city) 
		    event = Event.getByHrefAndCity(filters.event, filters.city)
	    if(!event) event = this.getClosestEvent()
	    
	    this.owner.view.renderPreviews(this.eventsDB.getAll(), event)
	    this.owner.view.modelChanged(event)
	},
	
	setState: function (state)
	{
		var event = this.eventsDB.getByName(state.name)
		event.name = state.name
		
		this.owner.view.modelChanged(event)
	},
	
	needToRenderPreviews: function()
	{
		this.owner.view.renderPreviews(this.eventsDB.getAll())
	},
	
	getClosestEvent: function()
	{
	    var events = this.eventsDB.getAll()
	    var closest = null, smallestGap = Infinity
	    
	    for(var i = 0; i < events.length; i++) 
	    {
	        var curGap = new Date() - new Date(events[i].date)
	        if(curGap < smallestGap)
	        {
	            smallestGap = curGap
	            closest = events[i]
	        }
	    }
	    
	    return closest
	}
}
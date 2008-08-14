EventPage =
{
	initialize: function (nodes, eventsDB)
	{
		var view = this.view,
			model = this.model,
			controller = this.controller
		
		model.owner = this
		view.owner = this
		controller.owner = this
		
		view.initialize(nodes)
		controller.initialize()
		model.initialize(eventsDB)
		view.start()
	}
}

$.onload
(
	function ()
	{
		var nodes =
		{
			name: $('event-name'),
			destination: $('destination')
		}
		
		EventPage.initialize(nodes, DB.Events)
	}
)


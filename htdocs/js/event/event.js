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
			rating: cssQuery('#comming .rating')[0],
			sponsorsOthers: $('sponsors-others'),
			sponsorsOthersContent: cssQuery('#sponsors-others .b-content')[0]
		}
		
		EventPage.initialize(nodes, DB.Events)
	}
)


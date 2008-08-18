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
			sponsorsLow: $('low-sponsors'),
			sponsorsLowContent: cssQuery('#low-sponsors .b-content')[0],
			sponsorsMedium: $('medium-sponsors'),
			sponsorsHighTitle: cssQuery('#sidebar .b-title h4')[0],
			sponsorsHigh: cssQuery('#sidebar .main-sponsor')[0]
		}
		
		EventPage.initialize(nodes, DB.Events)
	}
)


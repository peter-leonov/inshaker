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
			illustration: $('illustration'),
			illustrationPopups: cssQuery('#illustration img')[0],
			rating: cssQuery('#comming .rating')[0],
			sponsorsLow: $('low-sponsors'),
			sponsorsLowContent: cssQuery('#low-sponsors .b-content')[0],
			sponsorsMedium: $('medium-sponsors'),
			sponsorsHighTitle: cssQuery('#sidebar .b-title h4')[0],
			sponsorsHigh: cssQuery('#sidebar .main-sponsor')[0],
			formPopup: $('form-popup'),
			formPopupOverlay: cssQuery('#form-popup #overlay')[0],
			formPopupNameInput: cssQuery('#form-popup input[type=hidden]')[0],
			variableInputs: cssQuery('#form-popup .variable')[0]
		}
		
		// log(document.documentElement.appendChild($('form-popup')))
		
		// document.addEventListener('click', function () { alert(document.body.parentNode.scrollHeight + document.body.parentNode.scrollTop) })
		
		EventPage.initialize(nodes, DB.Events)
	}
)


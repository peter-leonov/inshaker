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
		model.initialize(eventsDB)
		controller.initialize()
		
		view.readEvent()
	}
}

$.onload(function () { document.documentElement.remClassName('loading') })

$.onload
(
	function ()
	{
		var nodes =
		{
			name: $('event-name'),
			promoBack: $('promo-back'),
			mark: $('mark'),
			previews: cssQuery('.previews')[0],
			previewSurface: cssQuery('.previews .viewport .surface')[0],
			illustration: $('illustration'),
			illustrationPopups: cssQuery('#illustration img')[0],
			rating: cssQuery('#comming .rating')[0],
			ratingHead: cssQuery('#comming h2')[0],
			ratingShowAll: cssQuery('#comming .list-all')[0],
			ratingFrom: cssQuery('#comming .from')[0],
			sponsorsLow: $('low-sponsors'),
			sponsorsLowContent: cssQuery('#low-sponsors .b-content')[0],
			sponsorsMedium: $('medium-sponsors'),
			sponsorsHighBlock: cssQuery('#main-sponsors')[0],
			sponsorsHighTitle: cssQuery('#main-sponsors .b-title h4')[0],
			sponsorsHigh: cssQuery('#main-sponsors .banner')[0],
			form: cssQuery('#form-popup form')[0],
			formPopup: $('form-popup'),
			formPopupOverlay: cssQuery('#form-popup #overlay')[0],
			formPopupMenu: cssQuery('#form-popup .menu')[0],
			formPopupFields: cssQuery('#form-popup .fields')[0],
			formPopupThanks: cssQuery('#form-popup .thanks')[0],
			formPopupHolding: cssQuery('#form-popup .holding')[0],
			formPopupNameInput: cssQuery('#form-popup input[type=hidden]')[0],
			formPopupSubmit: cssQuery('#form-popup input[type=submit]')[0],
			variableInputs: cssQuery('#form-popup .variable')[0],
			getInvitation: [$('get-invitation'), $('invitations-only'), cssQuery('.about .sign-on')[0]]
		}
		
		// log(document.documentElement.appendChild($('form-popup')))
		
		// document.addEventListener('click', function () { alert(document.body.parentNode.scrollHeight + document.body.parentNode.scrollTop) })
		
		EventPage.initialize(nodes, Event)
	}
)


<!--# include file="/lib/Programica/Request.js" -->
<!--# include file="/lib/Programica/Form.js" -->

<!--# include file="/lib/Programica/Widget.js" -->
<!--# include file="/lib/Widgets/FormPoster.js" -->
<!--# include file="/lib/Widgets/Switcher.js" -->


<!--# include file="/js/event/model.js" -->
<!--# include file="/js/event/controller.js" -->
<!--# include file="/js/event/view.js" -->


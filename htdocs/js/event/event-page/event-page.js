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

$.onready(function ()
{
	document.documentElement.removeClassName('loading')
	UserAgent.setupDocumentElementClassNames()
})

$.onready
(
	function ()
	{
		var nodes =
		{
			name: $('#event-name'),
			promoBack: $('#promo-back'),
			mark: $('#mark'),
			previews: $('.previews'),
			previewSurface: $('.previews .viewport .surface'),
			illustration: $('#illustration'),
			illustrationPopups: $('#illustration img'),
			rating: $('#comming .rating'),
			ratingHead: $('#comming h2'),
			ratingShowAll: $('#comming .list-all'),
			ratingFrom: $('#comming .from'),
			sidebar: $('#sidebar'),
			sponsorsLow: $('#low-sponsors'),
			sponsorsLowContent: $('#low-sponsors .b-content'),
			sponsorsMedium: $('#medium-sponsors'),
			sponsorsHighBlock: $('#main-sponsors'),
			sponsorsHighTitle: $('#main-sponsors .b-title h4'),
			sponsorsHigh: $('#main-sponsors .banner'),
			form: $('#form-popup form'),
			formPopup: $('#form-popup'),
			formPopupOverlay: $('#form-popup #overlay'),
			formPopupContent: $('#form-popup .content'),
			formPopupMenu: $('#form-popup .menu'),
			formPopupFields: $('#form-popup .fields'),
			formPopupThanks: $('#form-popup .thanks'),
			formPopupHolding: $('#form-popup .holding'),
			formPopupNameInput: $('#form-popup input[name=event]'),
			formPopupHrefInput: $('#form-popup input[name=href]'),
			formPopupSubmit: $('#form-popup input[type=submit]'),
			variableInputs: $('#form-popup .variable'),
			getInvitation: [$('#invitations-only'), $('.about .sign-on')]
		}
		
		// log(document.documentElement.appendChild($('#form-popup')))
		
		// document.addEventListener('click', function () { alert(document.body.parentNode.scrollHeight + document.body.parentNode.scrollTop) })
		
		EventPage.initialize(nodes, Event)
	}
)


<!--# include virtual="/liby/widgets/input-tip.js" -->

<!--# include virtual="/liby/modules/form-helper.js" -->
<!--# include virtual="/liby/modules/interpolate.js" -->

<!--# include virtual="/liby/modules/motion.js" -->
<!--# include virtual="/liby/modules/motion-types.js" -->
<!--# include virtual="/liby/modules/animation.js" -->
<!--# include virtual="/js/common/rolling-images.js" -->
<!--# include virtual="/js/common/humanize.js" -->
<!--# include virtual="/js/event/switcher.js" -->


<!--# include virtual="model.js" -->
<!--# include virtual="controller.js" -->
<!--# include virtual="view.js" -->

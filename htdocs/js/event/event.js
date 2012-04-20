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
	var de = document.documentElement
	de.removeClassName('loading')
	de.addClassName(guessBrowser(navigator.userAgent).join(' '))
	de.addClassName(guessOS(navigator.userAgent).join(' '))
})

function guessOS (ua)
{
	var m = /Windows/.exec(ua)
	if (m)
		return ['win']
	
	var m = /Macintosh|Mac OS/.exec(ua)
	if (m)
		return ['mac']
}

function guessBrowser (ua)
{
	function classes (n, a, b, c)
	{
		return [n, n + '-' + a, n + '-' + a + '-' + b, n + '-' + a + '-' + b + '-' + c]
	}
	
	var m = /Firefox\/(\d+)\.(\d+)\.(\d+)/.exec(ua)
	if (m)
		return classes('firefox', m[1], m[2], m[3])
	
	var m = /Opera\/\d+.+Version\/(\d+)\.(\d)(\d)/.exec(ua)
	if (m)
		return classes('opera', m[1], m[2], m[3])
	
	var m = /Opera\/(\d+)\.(\d)(\d)/.exec(ua)
	if (m)
		return classes('opera', m[1], m[2], m[3])
	
	var m = /MSIE (\d+)\./.exec(ua)
	if (m)
		return ['msie', 'msie-' + m[1]]
	
	var m = /Version\/(\d+)\.(\d+)\.(\d+) Safari\/\d+/.exec(ua)
	if (m)
		return classes('safari', m[1], m[2], m[3])
	
	var m = /Chrome\/(\d+)\.(\d+)\.(\d+)/.exec(ua)
	if (m)
		return classes('chrome', m[1], m[2], m[3])
	
	return []
}

$.onready
(
	function ()
	{
		var nodes =
		{
			name: $('event-name'),
			promoBack: $('promo-back'),
			mark: $('mark'),
			previews: $$('.previews')[0],
			previewSurface: $$('.previews .viewport .surface')[0],
			illustration: $('illustration'),
			illustrationPopups: $$('#illustration img')[0],
			rating: $$('#comming .rating')[0],
			ratingHead: $$('#comming h2')[0],
			ratingShowAll: $$('#comming .list-all')[0],
			ratingFrom: $$('#comming .from')[0],
			sidebar: $('sidebar'),
			sponsorsLow: $('low-sponsors'),
			sponsorsLowContent: $$('#low-sponsors .b-content')[0],
			sponsorsMedium: $('medium-sponsors'),
			sponsorsHighBlock: $$('#main-sponsors')[0],
			sponsorsHighTitle: $$('#main-sponsors .b-title h4')[0],
			sponsorsHigh: $$('#main-sponsors .banner')[0],
			form: $$('#form-popup form')[0],
			formPopup: $('form-popup'),
			formPopupOverlay: $$('#form-popup #overlay')[0],
			formPopupContent: $$('#form-popup .content')[0],
			formPopupMenu: $$('#form-popup .menu')[0],
			formPopupFields: $$('#form-popup .fields')[0],
			formPopupThanks: $$('#form-popup .thanks')[0],
			formPopupHolding: $$('#form-popup .holding')[0],
			formPopupNameInput: $$('#form-popup input[name=event]')[0],
			formPopupHrefInput: $$('#form-popup input[name=href]')[0],
			formPopupSubmit: $$('#form-popup input[type=submit]')[0],
			variableInputs: $$('#form-popup .variable')[0],
			getInvitation: [$('invitations-only'), $$('.about .sign-on')[0]]
		}
		
		// log(document.documentElement.appendChild($('form-popup')))
		
		// document.addEventListener('click', function () { alert(document.body.parentNode.scrollHeight + document.body.parentNode.scrollTop) })
		
		EventPage.initialize(nodes, Event)
	}
)


<!--# include virtual="/liby/widgets/input-tip.js" -->

<!--# include virtual="/liby/modules/form-helper.js" -->
<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/liby/modules/request.js" -->

<!--# include virtual="/liby/modules/motion.js" -->
<!--# include virtual="/liby/modules/motion-types.js" -->
<!--# include virtual="/liby/modules/animation.js" -->
<!--# include virtual="/js/common/rolling-images.js" -->
<!--# include virtual="/js/common/humanize.js" -->
<!--# include virtual="/js/event/switcher.js" -->


<!--# include virtual="/js/event/model.js" -->
<!--# include virtual="/js/event/controller.js" -->
<!--# include virtual="/js/event/view.js" -->
<!--# include virtual="/js/event/interpolate.js" -->

<!--# include virtual="/lib-0.3/core/prototype.js" -->
<!--# include virtual="/lib-0.3/modules/log.js" -->
<!--# include virtual="/lib-0.3/modules/plural.js"-->
<!--# include virtual="/lib-0.3/modules/array-randomize.js"-->
<!--# include virtual="/lib-0.3/modules/mvc.js" -->
<!--# include virtual="/lib-0.3/modules/cosy.js" -->
<!--# include virtual="/lib-0.3/modules/require.js" -->
<!--# include virtual="/lib-0.3/modules/selectors.js" -->
<!--# include virtual="/lib-0.3/modules/onready.js" -->
<!--# include virtual="/lib-0.3/modules/element.js" -->
<!--# include virtual="/lib-0.3/modules/nodes.js" -->
<!--# include virtual="/lib-0.3/modules/event-driven.js" -->
<!--# include virtual="/lib-0.3/modules/global-timer.js" -->
<!--# include virtual="/lib-0.3/modules/kinematics.js" -->
<!--# include virtual="/lib-0.3/modules/moveable.js" -->
<!--# include virtual="/lib-0.3/widgets/infinite-scroller.js" -->
<!--# include virtual="/lib-0.3/modules/gridder.js"-->
<!--# include virtual="/lib-0.3/modules/visibility-frame.js"-->
<!--# include virtual="/lib-0.3/modules/boxer.js"-->
<!--# include virtual="/lib-0.3/modules/user-agent.js" -->


<!--# include virtual="/js/common/statistics.js" -->
<!--# include virtual="/js/combinator/throttler.js" -->
<!--# include virtual="/js/common/lazy-list.js" -->
<!--# include virtual="/js/common/cocktail-list.js" -->
<!--# include virtual="/js/common/rounded-corners.js" -->

$.onready(function () { setTimeout(function () { GoogleAnalytics.trackPageview() }, 250) })

<!--# include virtual="/js/common/theme.js" -->
$.onready(function () { Theme.bind() })

$.onready(function ()
{
	var year = $$('#copyright .year')[0]
	if (year)
		year.firstChild.nodeValue = new Date().getFullYear()
})


String.prototype.htmlName = function () { return this.replace(/[^\w\-\.]/g, "_").toLowerCase() }

require.names =
{
	'Good': '/js/entities/Good.js'
}

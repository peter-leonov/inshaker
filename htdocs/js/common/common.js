<!--# include virtual="/liby/fixes/dom-token-list.js" -->

<!--# include virtual="/liby/modules/prototype.js" -->
<!--# include virtual="/liby/modules/log.js" -->
<!--# include virtual="/liby/modules/plural.js"-->
<!--# include virtual="/liby/modules/array-randomize.js"-->
<!--# include virtual="/liby/modules/require.js" -->
<!--# include virtual="/liby/modules/cosy.js" -->
<!--# include virtual="/liby/modules/element.js" -->
<!--# include virtual="/liby/modules/nodes.js" -->
<!--# include virtual="/liby/modules/event-driven.js" -->
<!--# include virtual="/liby/modules/global-timer.js" -->
<!--# include virtual="/liby/modules/kinematics.js" -->
<!--# include virtual="/liby/modules/moveable.js" -->
<!--# include virtual="/liby/widgets/infinite-scroller.js" -->
<!--# include virtual="/liby/modules/gridder.js"-->
<!--# include virtual="/liby/modules/visibility-frame.js"-->
<!--# include virtual="/liby/modules/boxer.js"-->
<!--# include virtual="/liby/modules/user-agent.js" -->
<!--# include virtual="/liby/modules/child-indexed-path.js"-->
<!--# include virtual="/liby/modules/cloner.js"-->
<!--# include virtual="/liby/modules/function-throttle.js" -->
<!--# include virtual="/liby/modules/state-machine.js" -->
<!--# include virtual="/liby/modules/url-encode.js"-->
<!--# include virtual="/liby/modules/request.js"-->
<!--# include virtual="/liby/modules/rus-date.js" -->

if (!document.documentElement.classList)
	$.load('/liby/fixes/class-list.js')

if (!document.querySelectorAll)
	$.load('/liby/fixes/dom-level2-selectors.js')

<!--# include virtual="/js/common/db.js" -->
<!--# include virtual="/js/common/statistics.js" -->
<!--# include virtual="/js/common/lazy-list.js" -->
<!--# include virtual="/js/common/cocktail-list.js" -->
<!--# include virtual="/js/common/rounded-corners.js" -->
<!--# include virtual="/js/common/popup.js" -->
<!--# include virtual="/js/common/branding-scroller.js" -->
<!--# include virtual="/js/common/mail.js" -->

// recycle local storage space
window.localStorage.removeItem('inshaker.user_history')

<!--# include virtual="/w/shop-map-banner/shop-map-banner.js" -->

<!--# include virtual="/skin/skin.js" -->

String.prototype.htmlName = function () { return this.replace(/[^\w\-\.]/g, "_").toLowerCase() }

require.names =
{
	'Good': '/js/entities/Good.js'
}

window.navigator.publicIP = '<!--# echo var="remote_addr" -->'

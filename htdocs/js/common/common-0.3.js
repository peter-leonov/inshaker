<!--# include virtual="/lib-0.3/modules/tracker-ga.js" -->
<!--# include virtual="/lib-0.3/modules/oops.js" -->
Oops.maybeEnable()

<!--# include virtual="/lib-0.3/core/prototype.js" -->
<!--# include virtual="/lib-0.3/modules/log.js" -->
<!--# include virtual="/lib-0.3/modules/mvc.js" -->
<!--# include virtual="/lib-0.3/modules/cosy.js" -->
<!--# include virtual="/lib-0.3/modules/selectors.js" -->
<!--# include virtual="/lib-0.3/modules/onready.js" -->
<!--# include virtual="/lib-0.3/modules/element.js" -->
<!--# include virtual="/lib-0.3/modules/nodes.js" -->
<!--# include virtual="/lib-0.3/modules/event-driven.js" -->
<!--# include virtual="/lib-0.3/modules/global-timer.js" -->
<!--# include virtual="/lib-0.3/modules/kinematics.js" -->

<!--# include file="/js/common/analytics.js" -->
<!--# include file="/js/common/cocktail-list.js" -->

String.prototype.htmlName = function () { return this.replace(/[^\w\-\.]/g, "_").toLowerCase() }
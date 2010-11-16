<!--# include virtual="/lib-0.3/modules/tracker-ga.js" -->
<!--# include virtual="/lib-0.3/modules/oops.js" -->
Oops.maybeEnable()

<!--# include file="/lib/Programica/Init.js" -->
<!--# include file="/lib/Programica/Fixes.js" -->
<!--# include file="/lib/Programica/OnReady.js" -->
<!--# include file="/lib/Programica/DOM.js" -->
<!--# include file="/lib/Programica/Animation.js" -->

<!--# include file="/lib/Programica/UA.js" -->
<!--# include file="/lib/Programica/Humanize.js" -->
<!--# include file="/lib/Programica/Stringify.js" -->
<!--# include file="/lib/Programica/Sizzle.js" -->
<!--# include file="/lib/Widgets/RollingImagesLite.js" -->

<!--# include virtual="/lib-0.3/modules/nodes.js" -->

<!--# include file="/js/common/analytics.js" -->
<!--# include file="/js/common/statistics.js" -->
<!--# include file="/js/common/rutils.js" -->
<!--# include file="/js/common/rounded-corners.js" -->

String.prototype.htmlName = function () { return this.replace(/[^\w\-\.]/g, "_").toLowerCase() }
String.prototype.capitalize = function () { return this.charAt(0).toUpperCase() + this.substr(1) }

;(function(){

var year = cssQuery('#copyright .year')[0]
if (year)
	year.innerHTML = new Date().getFullYear()

})();

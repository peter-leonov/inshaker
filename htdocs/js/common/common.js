<!--# include virtual="/lib/Programica/Fixes.js" -->
<!--# include virtual="/lib/Programica/Init.js" -->
<!--# include virtual="/lib/Programica/OnReady.js" -->
<!--# include virtual="/lib/Programica/DOM.js" -->
<!--# include virtual="/lib/Programica/Animation.js" -->

<!--# include virtual="/lib/Programica/UA.js" -->
<!--# include virtual="/lib/Programica/Humanize.js" -->
<!--# include virtual="/lib/Programica/Stringify.js" -->
<!--# include virtual="/lib/Programica/Sizzle.js" -->
<!--# include virtual="/lib/Widgets/RollingImagesLite.js" -->

<!--# include virtual="/lib-0.3/modules/nodes.js" -->

<!--# include virtual="/js/common/yandex-metrika.js" -->
<!--# include virtual="/js/common/statistics.js" -->
<!--# include virtual="/js/common/rutils.js" -->
<!--# include virtual="/js/common/rounded-corners.js" -->

$.onready(function () { setTimeout(function ()
{
	GoogleAnalytics.trackPageview()
	YandexMetrika.trackPageview()
}, 250) })

String.prototype.htmlName = function () { return this.replace(/[^\w\-\.]/g, "_").toLowerCase() }
String.prototype.capitalize = function () { return this.charAt(0).toUpperCase() + this.substr(1) }

;(function(){

var year = cssQuery('#copyright .year')[0]
if (year)
	year.innerHTML = new Date().getFullYear()

})();

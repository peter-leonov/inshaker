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

<!--# include file="/js/common/analytics.js" -->
<!--# include file="/js/common/rutils.js" -->

String.prototype.htmlName = function () { return this.replace(/[^\w\-\.]/g, "_").toLowerCase() }
String.prototype.capitalize = function () { return this.charAt(0).toUpperCase() + this.substr(1) }

$.onready
(
	function ()
	{
		// anti-yuppiebar
		function goTop () { window.parent.location = window.location }
		function goDefend ()
		{
			try
			{
				var as = cssQuery('a')
				for (var i = 0; i < as.length; i++)
					as[i].target = '_top'
			}
			catch (ex) {}
		}
		if (window.parent !== window)
			setTimeout(goDefend, 100)
	}
)
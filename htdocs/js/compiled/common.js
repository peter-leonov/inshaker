<!--# include file="/js/common/programica.js" -->
<!--# include file="/js/common/rutils.js" -->

String.prototype.htmlName = function () { return this.replace(/[^\w\-\.]/g, "_").toLowerCase() }
String.prototype.capitalize = function () { return this.charAt(0).toUpperCase() + this.substr(1) }

$.onload
(
	function ()
	{
		setTimeout(function () { $.include('/js/common/analytics.js') }, 1200)
		
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

// document.addEventListener('DOMContentLoaded', function (e) { $.onready.run(e) }, false)
// document.attachEvent('contentready', function (e) { alert('contentready') })
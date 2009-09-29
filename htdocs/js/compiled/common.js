<!--# include file="/js/common/programica.js" -->
<!--# include file="/js/common/util.js" -->


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

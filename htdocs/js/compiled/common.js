<!--# include file="/js/common/programica.js" -->

<!--# include file="/js/common/util.js" -->
<!--# include file="/js/common/storage.js" -->
<!--# include file="/js/common/dnd.js" -->
<!--# include file="/js/common/good_helper.js" -->
<!--# include file="/js/common/datafilter.js" -->
<!--# include file="/js/common/maps.js" -->
<!--# include file="/js/common/theme.js" -->

<!--# include file="/js/calculator/model.js" -->
<!--# include file="/js/calculator/view.js" -->
<!--# include file="/js/calculator/controller.js" -->
<!--# include file="/js/calculator/calculator.js" -->

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
			
			setTimeout(function () { goTop() }, 60000)
		}
		if (window.parent !== window)
			setTimeout(goDefend, 100)
	}
)

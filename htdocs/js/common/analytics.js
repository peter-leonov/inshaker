;(function(){

var interval
function load ()
{
	$.include(('https:' == document.location.protocol ? 'https://ssl.' : 'http://www.') + 'google-analytics.com/ga.js')
	interval = setInterval(check, 500)
}

function check ()
{
	if (window._gat)
	{
		clearInterval(interval)
		try
		{
			_gat._getTracker("UA-1635720-11")._trackPageview()
		}
		catch (ex) {}
	}
}

$.onready(function () { setTimeout(function () { load() }, 250) })

})();
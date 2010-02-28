;(function(){

var account = 'UA-1635720-11'

var _gaq = window._gaq
if (!_gaq)
	_gaq = window._gaq = []

_gaq.push(function ()
{
	var tracker = window._gaq._createAsyncTracker(account, 'tracker')
	tracker._trackPageview()
})

_gaq.push(function ()
{
	var tracker = window._gaq._getAsyncTracker('tracker')
	tracker._trackPageview()
})

// async loading of async ga.js :)
function load ()
{
	// untouched inclusion snippet
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(ga);
}
$.onready(function () { setTimeout(function () { load() }, 250) })

})();
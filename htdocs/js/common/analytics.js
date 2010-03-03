;(function(){

var account = 'UA-1635720-11'

if (!window._gaq)
	window._gaq = []

window._gaq.push(['_setAccount', account])
window._gaq.push(['_trackPageview'])

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
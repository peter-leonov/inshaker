<!--# include file="/lib-0.3/modules/url-encode.js" -->
<!--# include file="/lib-0.3/modules/request.js" -->
<!--# include file="/js/printer/printer.js" -->

;(function(){

function pageLoad ()
{
	var name = decodeURIComponent(window.location.hash.substr(1))
	Printer.initCocktail(name)
};
$.onload(pageLoad)

})();
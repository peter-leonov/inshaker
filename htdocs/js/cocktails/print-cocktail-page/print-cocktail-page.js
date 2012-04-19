<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/liby/modules/request.js" -->

<!--# include virtual="/js/cocktails/cocktails-printer.js" -->

;(function(){

function pageLoad ()
{
	var name = decodeURIComponent(window.location.hash.substr(1))
	Printer.initCocktail(name)
};
$.onload(pageLoad)

})();
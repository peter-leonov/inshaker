<!--# include virtual="/js/cocktails/cocktails-printer.js" -->

;(function(){

function pageLoad ()
{
	var name = decodeURIComponent(window.location.hash.substr(1))
	Printer.initCocktail(name)
};
$.onload(pageLoad)

})();
<!--# include file="/js/printer/printer.js" -->

;(function(){

function pageLoad ()
{
    var name = window.location.hash.substr(1)
    Printer.initCocktail(name)
};
$.onload(pageLoad)

})();
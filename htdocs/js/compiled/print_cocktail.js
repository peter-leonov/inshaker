<!--#include file="/js/printer/printer.js" -->

function pageLoad(){
    var loc = window.location.hash;
    Printer.init("cocktail", loc.substr(1, loc.length-1));
};
window.addEventListener('load', function(e){ pageLoad() }, false);

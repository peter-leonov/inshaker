<!--#include file="/js/common/analytics.js" -->
<!--#include file="/lib/json2.js" -->
<!--#include file="/js/common/programica.js" -->
<!--#include file="/js/common/util.js" -->
<!--#include file="/js/common/storage.js" -->
<!--#include file="/js/common/good_helper.js" -->
<!--#include file="/js/common/datafilter.js" -->
<!--#include file="/js/printer/printer.js" -->

function pageLoad(){
    var loc = window.location.hash;
    Printer.init("cocktail", loc.substr(1, loc.length-1));
};
window.addEventListener('load', function(e){ pageLoad() }, false);

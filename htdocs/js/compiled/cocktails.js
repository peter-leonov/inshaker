<!--#include file="/js/common/autocompleter.js" -->
<!--#include file="/js/cocktails/model.js" -->
<!--#include file="/js/cocktails/controller.js" -->

$.onload(function(){
	$('preloader').hide();
	document.documentElement.style.overflowY="auto";
	new Programica.RollingImagesLite($('results_display'));
	Controller.init();
	Calculator.init();
})

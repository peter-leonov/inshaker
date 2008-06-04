<!--#include file="/js/cocktail/model.js" -->
<!--#include file="/js/cocktail/controller.js" -->

$.onload(function(){
	new Programica.RollingImagesLite($('recommendations'));
	new Programica.RollingImagesLite($('related'), {animationType: 'easeInOutCubic'});
	new Programica.RollingImagesLite($('ingredients'), {animationType: 'easeInOutCubic'});
	Controller.init();
	Calculator.init();
})
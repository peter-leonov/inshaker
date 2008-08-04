<!--# include file="/js/cocktail/model.js" -->
<!--# include file="/js/cocktail/controller.js" -->

$.onload(function(){
	var aniOpts = {animationType: 'easeInOutCubic'};
	new Programica.RollingImagesLite($('recommendations'), aniOpts);
	new Programica.RollingImagesLite($('related'), aniOpts);
	new Programica.RollingImagesLite($('ingredients'), aniOpts);
	Controller.init();
	Calculator.init();
})
$.onready(function(){
	IngredientPopup.bootstrap()
	
	var aniOpts = {animationType: 'easeInOutCubic'};
	new RollingImagesLite($('recommendations'), aniOpts);
	new RollingImagesLite($('related'), aniOpts);
	new RollingImagesLite($('ingredients'), aniOpts);
	Controller.init();
	Calculator.init();
})

<!--# include file="/js/cocktail/model.js" -->
<!--# include file="/js/cocktail/controller.js" -->

$.onready(function(){
	UserAgent.setupDocumentElementClassNames()
	IngredientPopup.bootstrap()
	
	var aniOpts = {animationType: 'easeInOutCubic'};
	new RollingImagesLite($('related'), aniOpts);
	new RollingImagesLite($('ingredients'), aniOpts);
	Controller.init();
	Calculator.init();
	
	ShareButtons.bootstrap({text: 'Коктейль «' + Controller.name + '»'})
})

<!--# include virtual="/js/common/share-buttons.js" -->
<!--# include virtual="/js/cocktail/model.js" -->
<!--# include virtual="/js/cocktail/controller.js" -->

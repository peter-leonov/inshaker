$.onready(function(){
	var aniOpts = {animationType: 'easeInOutCubic'};
	new RollingImagesLite($('recommendations'), aniOpts);
	new RollingImagesLite($('related'), aniOpts);
	new RollingImagesLite($('ingredients'), aniOpts);
	Controller.init();
	Calculator.init();
	Theme.bind()
})

<!--# include file="/lib-0.3/modules/motion.js" -->
<!--# include file="/lib-0.3/modules/motion-types.js" -->
<!--# include file="/lib-0.3/modules/animation.js" -->
<!--# include file="/js/common/rolling-images.js" -->
<!--# include file="/js/calculator/calculator.js" -->
<!--# include file="/js/cocktail/model.js" -->
<!--# include file="/js/cocktail/controller.js" -->

$.onready(function(){
	UserAgent.setupDocumentElementClassNames()
	IngredientPopup.bootstrap()
	
	var aniOpts = {animationType: 'easeInOutCubic'};
	new RollingImagesLite($('#related'), aniOpts);
	new RollingImagesLite($('#ingredients'), aniOpts);
	Controller.init();
	
	ShareButtons.bootstrap({text: 'Коктейль «' + Controller.name + '»'})
	
	var nodes =
	{
		page: document.documentElement,
		holder: $('#branded-image-holder')
	}
	
	var bs = new BrandingScroller()
	bs.bind(nodes)
})

<!--# include virtual="/js/cocktails/share-buttons.js" -->
<!--# include virtual="model.js" -->
<!--# include virtual="controller.js" -->
<!--# include virtual="/liby/fixes/onhashchange.js" -->
<!--# include virtual="/liby/modules/location-hash.js" -->

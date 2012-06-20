<!--# include virtual="/js/common/nodes-shortcut.js" -->
<!--# include virtual="/js/common/units.js" -->
<!--# include virtual="/liby/fixes/onhashchange.js" -->
<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/liby/modules/location-hash.js" -->

<!--# include virtual="/js/common/ingredient-popup.js" -->

;(function(){

<!--# include virtual="rating.js" -->

function onready ()
{
	IngredientPopup.bootstrap()
	
	var nodes =
	{
		widget: $('#ratings-widget'),
		'rating-total': $('#rating-total'),
		'rating-ingredient': $('#rating-ingredient'),
		'rating-tag': $('#rating-tag')
	}
	
	var widget = new RatingPage()
	
	widget.model.initialize
	(
		<!--# include virtual="/db/ratings/rating.json" -->,
		<!--# include virtual="/db/ratings/ingredients.json" -->,
		<!--# include virtual="/db/ratings/tags.json" -->
	)
	
	widget.bind(nodes)
}

$.onready(onready)

})();

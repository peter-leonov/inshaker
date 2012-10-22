<!--# include virtual="/js/common/nodes-shortcut.js" -->
<!--# include virtual="/liby/fixes/onhashchange.js" -->
<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/liby/modules/location-hash.js" -->

<!--# include virtual="/js/common/ingredient-popup.js" -->

;(function(){

<!--# include virtual="ratings-widget.js" -->

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	IngredientPopup.bootstrap()
	
	var nodes =
	{
		widget: $('#ratings-widget'),
		ratingTotal: $('#ratings-widget .rating-total'),
		ratingIngredient: $('#ratings-widget .rating-ingredient'),
		ratingTag: $('#ratings-widget .rating-tag')
	}
	
	var widget = new RatingsPage()
	
	widget.model.initialize
	(
		<!--# include virtual="/db/ratings/rating.json" -->,
		<!--# include virtual="/db/ratings/ingredients.json" -->,
		<!--# include virtual="/db/ratings/tags.json" -->
	)
	
	widget.bind(nodes)
	widget.checkState()
}

$.onready(onready)

})();

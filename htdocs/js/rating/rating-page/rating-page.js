;(function(){

<!--# include virtual="rating.js" -->

function onready ()
{

	IngredientPopup.bootstrap()
	
	var nodes =
	{
		mainWrapper: $('#common-main-wrapper'),
		ratingTotal: $('#rating-total'),
		ratingIngredient: $('#rating-ingredient'),
		ratingTag: $('#rating-tag')
	}

	var widget = new RatingPage()
	widget.bind(nodes)
}

$.onready(onready)

})();

<!--# include virtual="/js/common/nodes-shortcut.js" -->
<!--# include virtual="/js/common/units.js" -->

<!--# include virtual="/js/common/ingredient-popup.js" -->
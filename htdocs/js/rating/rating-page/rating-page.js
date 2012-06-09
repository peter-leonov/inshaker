;(function(){

<!--# include virtual="rating.js" -->

function onready ()
{

	var nodes =
	{
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
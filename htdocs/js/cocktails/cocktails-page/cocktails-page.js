<!--# include virtual="/liby/fixes/keydown-to-keypress.js"-->
<!--# include virtual="/js/common/nodes-shortcut.js" -->
<!--# include virtual="/liby/fixes/onhashchange.js" -->
<!--# include virtual="/liby/modules/location-hash.js" -->

<!--# include virtual="/w/shop-map-banner/shop-map-banner.js" -->

;(function(){

<!--# include virtual="cocktails-widget.js" -->

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	IngredientPopup.bootstrap()
	
	var nodes =
	{
		resultsDisplay: $('#results_display'),
		cocktailsList: $('#cocktails'),
		
		moreHolder: $('#more'),
		more: $('#more .button'),
		
		searchForm: $('#search_by_name .search-form'),
		searchByNameInput: $('#search_by_name input')
	}
	
	var widget = new CocktailsPage(nodes)
	widget.bind(nodes)
	widget.setCocktailsPerPage(40)
	widget.guessState()
	
	var nodes =
	{
		page: document.documentElement,
		holder: $('#branded-image-holder')
	}
	
	var bs = new BrandingScroller()
	bs.bind(nodes)
}

$.onready(onready)

})();

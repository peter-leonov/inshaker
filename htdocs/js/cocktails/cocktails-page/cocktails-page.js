<!--# include virtual="/liby/fixes/keydown-to-keypress.js"-->
<!--# include virtual="/js/common/nodes-shortcut.js" -->
<!--# include virtual="/liby/fixes/onhashchange.js" -->
<!--# include virtual="/liby/modules/location-hash.js" -->


;(function(){

<!--# include virtual="cocktails-widget.js" -->

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	IngredientPopup.bootstrap()
	
	var nodes =
	{
	  root: $('.cocktails-search-widget'),
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

	if (window.BannersWidget)
		window.BannersWidget('all-cocktails')

	var bs = new BrandingScroller()
	bs.bind(nodes)
}

$.onready(onready)

})();

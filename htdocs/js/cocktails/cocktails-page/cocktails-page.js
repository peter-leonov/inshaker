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
		bodyWrapper: $('#common-main-wrapper .column-main'),
		resultsDisplay: $('#results_display'),
		resultsRoot: $('#surface'),
		cocktails: $('#cocktails'),
		
		bigNext: $(".pager .next"),
		
		searchByName: $('#search_by_name'),
		searchByNameInput: $('#search_by_name input'),
		
		mainArea: $('#b_content'),
		
		searchExampleName: $('#search_example_name'),
		searchExampleNameEng: $('#search_example_name_eng'),
		searchTipName: $('#search_tip_name'),
		
		panels: $('#panels'),
		
		cartEmpty: $('#cart_draghere'),
		cartFull: $('#cart_contents'),
		
		spotlighted: $('#spotlighted')
	}
	
	var widget = new CocktailsPage(nodes)
	widget.bind(nodes)
	
	Calculator.init()
	
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
